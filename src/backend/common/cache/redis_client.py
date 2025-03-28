"""
Redis客户端配置模块

提供与Redis服务器的连接和基本操作功能。
"""

import os
import redis
from typing import Optional, Any, Dict, List, Union
import json
import logging

logger = logging.getLogger(__name__)

# 从环境变量获取Redis连接配置
REDIS_URL = os.environ.get('REDIS_URL', 'redis://redis:6379/0')

# 全局Redis客户端实例
_redis_client = None

def get_redis_connection() -> redis.Redis:
    """
    获取Redis连接实例（单例模式）
    
    Returns:
        redis.Redis: Redis客户端实例
    """
    global _redis_client
    
    if _redis_client is None:
        try:
            _redis_client = redis.from_url(REDIS_URL, decode_responses=True)
            # 测试连接
            _redis_client.ping()
            logger.info(f"成功连接到Redis服务器: {REDIS_URL}")
        except redis.ConnectionError as e:
            logger.error(f"无法连接到Redis服务器: {REDIS_URL}, 错误: {str(e)}")
            # 创建一个虚拟的Redis客户端用于开发/测试
            from fakeredis import FakeRedis
            _redis_client = FakeRedis(decode_responses=True)
            logger.warning("使用FakeRedis作为后备方案")
        except Exception as e:
            logger.error(f"初始化Redis客户端时发生未知错误: {str(e)}")
            raise
    
    return _redis_client

# 导出一个便捷的客户端实例
redis_client = get_redis_connection()

# 健康检查方法
def check_redis_health() -> Dict[str, Any]:
    """
    检查Redis服务健康状态
    
    Returns:
        Dict[str, Any]: 包含Redis健康状态的字典
    """
    status = {
        "service": "redis",
        "status": "unknown",
        "details": {}
    }
    
    try:
        client = get_redis_connection()
        response_time = client.ping()
        info = client.info()
        
        # 提取关键指标
        status["status"] = "healthy"
        status["details"] = {
            "version": info.get("redis_version", "unknown"),
            "uptime_in_seconds": info.get("uptime_in_seconds", 0),
            "connected_clients": info.get("connected_clients", 0),
            "used_memory_human": info.get("used_memory_human", "unknown"),
            "total_connections_received": info.get("total_connections_received", 0),
            "total_commands_processed": info.get("total_commands_processed", 0)
        }
    except Exception as e:
        status["status"] = "unhealthy"
        status["details"] = {"error": str(e)}
        
    return status 