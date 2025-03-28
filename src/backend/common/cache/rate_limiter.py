"""
Redis速率限制模块

使用Redis实现API速率限制功能。
"""

import time
import logging
from typing import Dict, Optional, Tuple, Union
from flask import request, g
from functools import wraps

from .redis_client import redis_client
from .config import RATE_LIMIT_CONFIG, CACHE_KEY_PREFIX

logger = logging.getLogger(__name__)


class RateLimiter:
    """基于Redis的速率限制器"""
    
    def __init__(self, prefix: str = CACHE_KEY_PREFIX):
        """
        初始化速率限制器
        
        Args:
            prefix (str): 缓存键前缀
        """
        self.prefix = prefix
        self._redis = redis_client
    
    def _get_rate_limit_key(self, identifier: str, rate_type: str = 'default') -> str:
        """
        构建速率限制键
        
        Args:
            identifier (str): 用户或IP标识符
            rate_type (str): 限制类型
            
        Returns:
            str: 缓存键
        """
        return f"{self.prefix}:ratelimit:{rate_type}:{identifier}"
    
    def is_rate_limited(
        self, 
        identifier: str, 
        rate_type: str = 'default',
        limit: Optional[int] = None,
        period: Optional[int] = None
    ) -> Tuple[bool, Dict[str, Union[int, float]]]:
        """
        检查是否超过速率限制
        
        Args:
            identifier (str): 用户或IP标识符
            rate_type (str): 限制类型（default、anonymous、authenticated、admin）
            limit (Optional[int]): 可选的自定义限制次数
            period (Optional[int]): 可选的自定义时间窗口（秒）
            
        Returns:
            Tuple[bool, Dict]: (是否受限, 限制信息)
        """
        # 获取对应的速率限制配置
        config = RATE_LIMIT_CONFIG.get(rate_type, RATE_LIMIT_CONFIG['default'])
        rate_limit = limit or config['limit']
        rate_period = period or config['period']
        
        # 构建Redis键
        rate_key = self._get_rate_limit_key(identifier, rate_type)
        
        # 获取当前时间窗口起始时间
        window_start = int(time.time()) // rate_period * rate_period
        expiry = window_start + rate_period
        
        # 获取当前请求计数
        current = self._redis.get(rate_key)
        if current is None:
            # 第一次请求，初始化计数
            self._redis.set(rate_key, 1, ex=rate_period)
            current_count = 1
        else:
            try:
                current_count = int(current)
                if current_count >= rate_limit:
                    # 已达到限制
                    is_limited = True
                else:
                    # 未达到限制，递增计数
                    current_count = self._redis.incr(rate_key)
                    is_limited = current_count > rate_limit
            except (ValueError, TypeError):
                # 计数值错误，重置
                self._redis.delete(rate_key)
                self._redis.set(rate_key, 1, ex=rate_period)
                current_count = 1
                is_limited = False
        
        # 确保键有正确的过期时间
        ttl = self._redis.ttl(rate_key)
        if ttl < 0:
            self._redis.expire(rate_key, rate_period)
        
        # 计算剩余时间
        now = time.time()
        reset_time = expiry
        time_to_reset = max(0, reset_time - now)
        
        # 构建响应信息
        info = {
            'limit': rate_limit,
            'remaining': max(0, rate_limit - current_count),
            'reset': reset_time,
            'used': current_count,
            'identifier': identifier,
            'rate_type': rate_type
        }
        
        return is_limited, info


# 创建默认的速率限制器实例
_rate_limiter = RateLimiter()


def rate_limit(
    limit: Optional[int] = None,
    period: Optional[int] = None,
    rate_type: Optional[str] = None,
    identifier_fn: Optional[callable] = None
):
    """
    API速率限制装饰器
    
    Args:
        limit (Optional[int]): 自定义的请求限制次数
        period (Optional[int]): 自定义的时间窗口（秒）
        rate_type (Optional[str]): 速率限制类型，支持default、anonymous、authenticated、admin
        identifier_fn (Optional[callable]): 自定义标识符生成函数
        
    Returns:
        callable: 装饰器函数
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # 获取用户标识符
            if identifier_fn:
                identifier = identifier_fn(*args, **kwargs)
            else:
                # 默认使用用户ID或IP地址
                user_id = getattr(g, 'user_id', None)
                if user_id:
                    identifier = f"user:{user_id}"
                    user_rate_type = getattr(g, 'user_role', 'authenticated')
                else:
                    identifier = f"ip:{request.remote_addr}"
                    user_rate_type = 'anonymous'
            
            # 确定速率限制类型
            actual_rate_type = rate_type or user_rate_type
            
            # 检查速率限制
            is_limited, info = _rate_limiter.is_rate_limited(
                identifier,
                actual_rate_type,
                limit,
                period
            )
            
            # 添加速率限制头信息
            def add_rate_limit_headers(response):
                response.headers['X-RateLimit-Limit'] = str(info['limit'])
                response.headers['X-RateLimit-Remaining'] = str(info['remaining'])
                response.headers['X-RateLimit-Reset'] = str(int(info['reset']))
                return response
            
            # 如果已经达到限制，返回429错误
            if is_limited:
                from flask import jsonify
                response = jsonify({
                    'status': 'error',
                    'message': '请求过于频繁，请稍后再试',
                    'error': 'rate_limit_exceeded'
                })
                response.status_code = 429
                return add_rate_limit_headers(response)
            
            # 正常处理请求
            response = f(*args, **kwargs)
            
            # 对于Flask Response对象，添加速率限制头信息
            from flask import Response
            if isinstance(response, Response):
                return add_rate_limit_headers(response)
            
            return response
        return decorated_function
    return decorator


# 直接使用的速率限制函数
def check_rate_limit(
    identifier: str, 
    rate_type: str = 'default',
    limit: Optional[int] = None,
    period: Optional[int] = None
) -> Tuple[bool, Dict[str, Union[int, float]]]:
    """
    检查速率限制，可在任何地方手动调用
    
    Args:
        identifier (str): 用户或IP标识符
        rate_type (str): 限制类型
        limit (Optional[int]): 可选的自定义限制次数
        period (Optional[int]): 可选的自定义时间窗口（秒）
        
    Returns:
        Tuple[bool, Dict]: (是否受限, 限制信息)
    """
    return _rate_limiter.is_rate_limited(identifier, rate_type, limit, period) 