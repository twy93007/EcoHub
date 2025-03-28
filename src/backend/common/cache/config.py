"""
Redis缓存配置模块

定义缓存策略、超时时间和常量。
"""

import os
from typing import Dict, Any

# Redis连接配置
REDIS_CONFIG = {
    "url": os.environ.get("REDIS_URL", "redis://redis:6379/0"),
    "socket_timeout": 5,
    "socket_connect_timeout": 5,
    "socket_keepalive": True,
    "health_check_interval": 30,
    "retry_on_timeout": True,
    "encoding": "utf-8",
    "decode_responses": True
}

# 缓存键前缀
CACHE_KEY_PREFIX = "ecohub"

# 默认缓存TTL（生存时间，单位：秒）
DEFAULT_TTL = 3600  # 1小时

# 针对不同数据类型的缓存TTL配置
TTL_CONFIG = {
    # 用户相关
    "user": 3600 * 24,  # 24小时
    "user_profile": 3600 * 2,  # 2小时
    "user_permissions": 3600 * 12,  # 12小时
    
    # 数据相关
    "dataset": 3600 * 4,  # 4小时
    "dataset_list": 300,  # 5分钟
    "data_table": 1800,  # 30分钟
    "data_preview": 600,  # 10分钟
    
    # 匹配相关
    "match_rules": 3600 * 8,  # 8小时
    "match_results": 3600 * 2,  # 2小时
    
    # 系统相关
    "system_settings": 3600 * 24,  # 24小时
    "api_response": 120,  # 2分钟
    "health_status": 60,  # 1分钟
}

# 缓存策略配置
CACHE_STRATEGIES = {
    # 针对不同API的缓存策略配置
    "api": {
        # 是否缓存GET请求
        "cache_get_requests": True,
        # 是否缓存搜索结果
        "cache_search_results": True,
        # 分页查询的最大缓存页数
        "max_cached_pages": 5,
    },
    
    # 并发请求处理策略
    "concurrency": {
        # 是否启用请求折叠（合并同一时间内的相同请求）
        "enable_request_coalescing": True,
        # 请求折叠的超时时间（毫秒）
        "coalescing_timeout_ms": 50,
    },
    
    # 缓存过期策略
    "expiration": {
        # 是否使用随机过期时间（避免缓存雪崩）
        "use_jittered_expiration": True,
        # 随机过期时间的抖动范围（百分比）
        "jitter_percentage": 10,
    },
    
    # 缓存无效化策略
    "invalidation": {
        # 是否在写操作后自动清除相关缓存
        "auto_invalidate_on_write": True,
        # 是否使用版本标记来管理缓存更新
        "use_versioning": True,
    }
}

# 需要排除缓存的路径前缀
NO_CACHE_PATHS = [
    "/api/v1/auth",
    "/api/v1/admin",
    "/api/v1/upload",
    "/api/v1/user/password",
]

# Redis限流配置
RATE_LIMIT_CONFIG = {
    # 默认API请求速率限制（次数/时间窗口）
    "default": {
        "limit": 100,  # 请求次数
        "period": 60,  # 时间窗口（秒）
    },
    # 匿名用户的API限制
    "anonymous": {
        "limit": 50,
        "period": 60,
    },
    # 登录用户的API限制
    "authenticated": {
        "limit": 200,
        "period": 60,
    },
    # 管理员用户的API限制
    "admin": {
        "limit": 500,
        "period": 60,
    }
}

# Redis布隆过滤器配置（用于高效缓存命中判断）
BLOOM_FILTER_CONFIG = {
    "enabled": True,
    "error_rate": 0.01,
    "capacity": 100000,
} 