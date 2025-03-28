"""
缓存管理模块

提供通用的缓存管理功能，包括缓存装饰器和缓存键管理。
"""

import functools
import hashlib
import inspect
import json
import logging
import time
from typing import Any, Callable, Dict, List, Optional, Tuple, Union
from .redis_client import get_redis_connection

logger = logging.getLogger(__name__)

class CacheManager:
    """Redis缓存管理器，提供对缓存操作的高级封装"""
    
    def __init__(self, prefix: str = "ecohub", default_ttl: int = 3600):
        """
        初始化缓存管理器
        
        Args:
            prefix (str): 缓存键前缀，用于隔离不同应用的缓存
            default_ttl (int): 默认缓存过期时间（秒）
        """
        self.prefix = prefix
        self.default_ttl = default_ttl
        self._redis = get_redis_connection()
    
    def _build_key(self, *parts: Any) -> str:
        """
        构建缓存键
        
        Args:
            *parts: 用于构建键的部分
            
        Returns:
            str: 格式化的缓存键
        """
        # 将所有部分转换为字符串并用冒号连接
        key_parts = [str(self.prefix)]
        for part in parts:
            if isinstance(part, (dict, list, tuple)):
                # 对于复杂类型，使用其JSON表示的哈希值
                part_str = hashlib.md5(json.dumps(part, sort_keys=True).encode()).hexdigest()
            else:
                part_str = str(part)
            key_parts.append(part_str)
        
        return ":".join(key_parts)
    
    def get(self, key: str, default: Any = None) -> Any:
        """
        获取缓存值
        
        Args:
            key (str): 缓存键
            default (Any): 当缓存不存在时返回的默认值
            
        Returns:
            Any: 缓存值或默认值
        """
        value = self._redis.get(key)
        if value is None:
            return default
        
        try:
            return json.loads(value)
        except json.JSONDecodeError:
            return value
    
    def set(self, key: str, value: Any, ttl: Optional[int] = None) -> bool:
        """
        设置缓存值
        
        Args:
            key (str): 缓存键
            value (Any): 要缓存的值
            ttl (Optional[int]): 过期时间（秒），为None时使用默认值
            
        Returns:
            bool: 操作成功返回True
        """
        if ttl is None:
            ttl = self.default_ttl
        
        try:
            if not isinstance(value, (str, bytes)):
                value = json.dumps(value)
            return self._redis.set(key, value, ex=ttl)
        except Exception as e:
            logger.error(f"设置缓存时出错: {str(e)}")
            return False
    
    def delete(self, *keys: str) -> int:
        """
        删除一个或多个缓存键
        
        Args:
            *keys: 要删除的缓存键
            
        Returns:
            int: 成功删除的键数量
        """
        if not keys:
            return 0
        return self._redis.delete(*keys)
    
    def exists(self, key: str) -> bool:
        """
        检查缓存键是否存在
        
        Args:
            key (str): 要检查的缓存键
            
        Returns:
            bool: 如果键存在返回True
        """
        return bool(self._redis.exists(key))
    
    def increment(self, key: str, amount: int = 1) -> int:
        """
        递增缓存值
        
        Args:
            key (str): 缓存键
            amount (int): 增加的数量
            
        Returns:
            int: 增加后的值
        """
        return self._redis.incrby(key, amount)
    
    def clear_pattern(self, pattern: str) -> int:
        """
        按模式清除缓存
        
        Args:
            pattern (str): 键模式
            
        Returns:
            int: 删除的键数量
        """
        keys = list(self._redis.scan_iter(pattern))
        if keys:
            return self._redis.delete(*keys)
        return 0

    def cache_decorator(
        self, 
        ttl: Optional[int] = None, 
        prefix: Optional[str] = None,
        key_fn: Optional[Callable] = None
    ) -> Callable:
        """
        缓存装饰器工厂
        
        Args:
            ttl (Optional[int]): 缓存过期时间（秒）
            prefix (Optional[str]): 缓存键前缀
            key_fn (Optional[Callable]): 自定义键生成函数
            
        Returns:
            Callable: 装饰器函数
        """
        def decorator(func: Callable) -> Callable:
            @functools.wraps(func)
            def wrapper(*args: Any, **kwargs: Any) -> Any:
                # 生成缓存键
                if key_fn is not None:
                    cache_key = key_fn(*args, **kwargs)
                else:
                    # 获取函数参数的名称
                    signature = inspect.signature(func)
                    bound_args = signature.bind(*args, **kwargs)
                    bound_args.apply_defaults()
                    
                    # 使用函数名和参数构建缓存键
                    key_prefix = prefix or func.__name__
                    cache_key = self._build_key(
                        key_prefix,
                        {k: v for k, v in bound_args.arguments.items() 
                         if k != 'self' and k != 'cls'}
                    )
                
                # 尝试从缓存获取
                cached_value = self.get(cache_key)
                if cached_value is not None:
                    logger.debug(f"缓存命中: {cache_key}")
                    return cached_value
                
                # 缓存未命中，执行原函数
                start_time = time.time()
                result = func(*args, **kwargs)
                execution_time = time.time() - start_time
                
                # 缓存结果
                self.set(cache_key, result, ttl)
                logger.debug(f"缓存未命中，已缓存结果: {cache_key} (执行时间: {execution_time:.3f}s)")
                
                return result
            
            # 添加清除缓存的辅助方法
            def clear_cache(*args: Any, **kwargs: Any) -> int:
                if key_fn is not None:
                    cache_key = key_fn(*args, **kwargs)
                    return self.delete(cache_key)
                else:
                    # 清除该函数的所有缓存
                    key_prefix = prefix or func.__name__
                    pattern = f"{self.prefix}:{key_prefix}:*"
                    return self.clear_pattern(pattern)
            
            wrapper.clear_cache = clear_cache
            return wrapper
        
        return decorator


# 创建默认的缓存管理器实例
_default_cache_manager = CacheManager()

# 导出一个便捷的缓存装饰器
def cache(ttl: Optional[int] = None, prefix: Optional[str] = None, key_fn: Optional[Callable] = None) -> Callable:
    """
    缓存装饰器，可用于缓存函数返回值
    
    Args:
        ttl (Optional[int]): 缓存过期时间（秒）
        prefix (Optional[str]): 缓存键前缀
        key_fn (Optional[Callable]): 自定义键生成函数
        
    Returns:
        Callable: 装饰器函数
    """
    return _default_cache_manager.cache_decorator(ttl=ttl, prefix=prefix, key_fn=key_fn) 