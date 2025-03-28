"""
Redis缓存中间件模块

提供用于Flask的缓存中间件，用于自动缓存API响应。
"""

import functools
import hashlib
import json
import logging
import time
from typing import Any, Callable, Dict, List, Optional, Tuple, Union
from urllib.parse import urlparse

from flask import Flask, Response, request, g
from werkzeug.exceptions import HTTPException

from .redis_client import redis_client
from .config import (
    CACHE_KEY_PREFIX,
    DEFAULT_TTL,
    TTL_CONFIG,
    CACHE_STRATEGIES,
    NO_CACHE_PATHS
)

logger = logging.getLogger(__name__)


def is_cacheable_request() -> bool:
    """
    检查当前请求是否可缓存
    
    Returns:
        bool: 如果请求可缓存返回True
    """
    # 只缓存GET请求
    if request.method != 'GET':
        return False
    
    # 检查是否在排除列表中
    path = request.path
    for no_cache_path in NO_CACHE_PATHS:
        if path.startswith(no_cache_path):
            return False
    
    # 检查请求头
    cache_control = request.headers.get('Cache-Control', '')
    if 'no-cache' in cache_control or 'no-store' in cache_control:
        return False
    
    return True


def generate_cache_key() -> str:
    """
    为当前请求生成缓存键
    
    Returns:
        str: 缓存键
    """
    # 获取URL路径（不含域名和协议）
    url_path = urlparse(request.url).path
    
    # 获取请求参数
    args = dict(request.args)
    
    # 获取用户身份标识（如果有）
    user_id = getattr(g, 'user_id', None) or 'anonymous'
    
    # 构建键的数据
    key_data = {
        'path': url_path,
        'args': args,
        'user_id': user_id
    }
    
    # 将数据转换为字符串并哈希
    key_str = json.dumps(key_data, sort_keys=True)
    key_hash = hashlib.md5(key_str.encode()).hexdigest()
    
    return f"{CACHE_KEY_PREFIX}:api:{key_hash}"


def get_cache_ttl(path: str) -> int:
    """
    根据请求路径获取缓存TTL
    
    Args:
        path (str): 请求路径
        
    Returns:
        int: 缓存TTL（秒）
    """
    # 尝试根据路径匹配合适的TTL
    for key, ttl in TTL_CONFIG.items():
        if key in path:
            return ttl
    
    # 默认为API响应的TTL
    return TTL_CONFIG.get("api_response", DEFAULT_TTL)


def add_jitter_to_ttl(ttl: int) -> int:
    """
    为TTL添加随机抖动，防止缓存雪崩
    
    Args:
        ttl (int): 原始TTL值
        
    Returns:
        int: 添加抖动后的TTL值
    """
    if not CACHE_STRATEGIES["expiration"]["use_jittered_expiration"]:
        return ttl
    
    import random
    jitter_percentage = CACHE_STRATEGIES["expiration"]["jitter_percentage"]
    jitter = random.uniform(-jitter_percentage/100, jitter_percentage/100)
    
    # 将jitter应用到TTL上（至少为1秒）
    return max(1, int(ttl * (1 + jitter)))


def cache_response(app: Flask) -> None:
    """
    注册Flask中间件，用于自动缓存API响应
    
    Args:
        app (Flask): Flask应用实例
    """
    @app.before_request
    def before_request() -> Optional[Response]:
        # 检查请求是否可缓存
        if not is_cacheable_request():
            return None
        
        # 生成缓存键
        cache_key = generate_cache_key()
        
        # 记录缓存键到g对象，以便在响应时使用
        g.cache_key = cache_key
        
        # 尝试获取缓存
        cached_response = redis_client.get(cache_key)
        if cached_response:
            try:
                data = json.loads(cached_response)
                # 重建响应对象
                response = Response(
                    data.get('body', ''),
                    status=data.get('status', 200),
                    mimetype=data.get('mimetype', 'application/json')
                )
                # 恢复头信息
                for key, value in data.get('headers', {}).items():
                    if key.lower() not in ('content-length', 'content-encoding'):
                        response.headers[key] = value
                
                # 添加缓存标记
                response.headers['X-Cache'] = 'HIT'
                logger.debug(f"缓存命中: {cache_key}")
                
                return response
            except Exception as e:
                logger.error(f"解析缓存响应时出错: {str(e)}")
                # 移除可能损坏的缓存
                redis_client.delete(cache_key)
        
        # 标记请求开始时间，用于计算处理时间
        g.request_start_time = time.time()
        return None

    @app.after_request
    def after_request(response: Response) -> Response:
        # 检查是否需要缓存此响应
        if (not hasattr(g, 'cache_key') or 
            not is_cacheable_request() or 
            response.status_code != 200):
            return response
        
        # 跳过流式响应和非JSON/HTML响应
        if (response.is_streamed or 
            not response.mimetype or 
            not (response.mimetype.startswith('application/json') or 
                 response.mimetype.startswith('text/html'))):
            return response
        
        # 构建要缓存的响应数据
        cached_data = {
            'body': response.get_data(as_text=True),
            'status': response.status_code,
            'mimetype': response.mimetype,
            'headers': {k: v for k, v in response.headers.items()}
        }
        
        # 获取适当的TTL
        ttl = get_cache_ttl(request.path)
        if CACHE_STRATEGIES["expiration"]["use_jittered_expiration"]:
            ttl = add_jitter_to_ttl(ttl)
        
        # 缓存响应
        try:
            redis_client.set(
                g.cache_key,
                json.dumps(cached_data),
                ex=ttl
            )
            
            # 添加缓存MISS标记
            response.headers['X-Cache'] = 'MISS'
            
            # 记录处理时间
            if hasattr(g, 'request_start_time'):
                process_time = time.time() - g.request_start_time
                logger.debug(
                    f"缓存响应: {g.cache_key}, "
                    f"TTL: {ttl}秒, "
                    f"处理时间: {process_time:.3f}秒"
                )
            
        except Exception as e:
            logger.error(f"缓存响应时出错: {str(e)}")
        
        return response


# 添加装饰器，用于手动控制缓存
def cache_view(ttl: Optional[int] = None):
    """
    装饰Flask视图函数，控制响应缓存
    
    Args:
        ttl (Optional[int]): 缓存TTL（秒），为None时使用默认值
        
    Returns:
        Callable: 装饰器函数
    """
    def decorator(f: Callable) -> Callable:
        @functools.wraps(f)
        def decorated_function(*args: Any, **kwargs: Any) -> Any:
            # 允许显式禁用缓存
            if ttl == 0:
                g.skip_cache = True
                return f(*args, **kwargs)
            
            # 检查请求是否可缓存
            if not is_cacheable_request():
                return f(*args, **kwargs)
            
            # 生成缓存键
            cache_key = generate_cache_key()
            g.cache_key = cache_key
            
            # 尝试获取缓存
            cached_response = redis_client.get(cache_key)
            if cached_response:
                try:
                    data = json.loads(cached_response)
                    # 重建响应对象
                    response = Response(
                        data.get('body', ''),
                        status=data.get('status', 200),
                        mimetype=data.get('mimetype', 'application/json')
                    )
                    # 恢复头信息
                    for key, value in data.get('headers', {}).items():
                        if key.lower() not in ('content-length', 'content-encoding'):
                            response.headers[key] = value
                    
                    # 添加缓存标记
                    response.headers['X-Cache'] = 'HIT'
                    logger.debug(f"视图函数缓存命中: {cache_key}")
                    
                    return response
                except Exception as e:
                    logger.error(f"解析缓存响应时出错: {str(e)}")
                    # 移除可能损坏的缓存
                    redis_client.delete(cache_key)
            
            # 缓存未命中，执行原始函数
            g.request_start_time = time.time()
            response = f(*args, **kwargs)
            
            # 如果不是标准响应对象，则直接返回
            if not isinstance(response, Response):
                return response
            
            # 检查是否应该缓存响应
            if response.status_code != 200 or getattr(g, 'skip_cache', False):
                return response
            
            # 构建要缓存的响应数据
            cached_data = {
                'body': response.get_data(as_text=True),
                'status': response.status_code,
                'mimetype': response.mimetype,
                'headers': {k: v for k, v in response.headers.items()}
            }
            
            # 获取适当的TTL
            cache_ttl = ttl or get_cache_ttl(request.path)
            if CACHE_STRATEGIES["expiration"]["use_jittered_expiration"]:
                cache_ttl = add_jitter_to_ttl(cache_ttl)
            
            # 缓存响应
            try:
                redis_client.set(
                    cache_key,
                    json.dumps(cached_data),
                    ex=cache_ttl
                )
                
                # 添加缓存MISS标记
                response.headers['X-Cache'] = 'MISS'
                
                # 记录处理时间
                if hasattr(g, 'request_start_time'):
                    process_time = time.time() - g.request_start_time
                    logger.debug(
                        f"视图函数缓存响应: {cache_key}, "
                        f"TTL: {cache_ttl}秒, "
                        f"处理时间: {process_time:.3f}秒"
                    )
                
            except Exception as e:
                logger.error(f"缓存响应时出错: {str(e)}")
            
            return response
        
        return decorated_function
    
    return decorator 