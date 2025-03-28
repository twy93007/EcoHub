"""
Redis缓存测试模块

提供用于测试Redis缓存连接和性能的工具。
"""

import json
import logging
import time
import random
import string
from typing import Dict, List, Any, Optional

from .redis_client import get_redis_connection, check_redis_health
from .cache_manager import CacheManager

logger = logging.getLogger(__name__)


def random_string(length: int = 10) -> str:
    """
    生成随机字符串
    
    Args:
        length (int): 字符串长度
        
    Returns:
        str: 随机字符串
    """
    return ''.join(random.choices(string.ascii_letters + string.digits, k=length))


def test_connection() -> Dict[str, Any]:
    """
    测试Redis连接
    
    Returns:
        Dict[str, Any]: 测试结果
    """
    logger.info("开始测试Redis连接...")
    result = {
        "success": False,
        "message": "",
        "details": {}
    }
    
    try:
        # 测试健康状态
        health_status = check_redis_health()
        result["details"]["health"] = health_status
        
        if health_status["status"] == "healthy":
            result["success"] = True
            result["message"] = "Redis连接成功"
        else:
            result["message"] = f"Redis连接失败: {health_status.get('details', {}).get('error', '未知错误')}"
    except Exception as e:
        result["message"] = f"测试Redis连接时发生错误: {str(e)}"
        logger.error(result["message"], exc_info=True)
    
    return result


def test_basic_operations() -> Dict[str, Any]:
    """
    测试基本Redis操作
    
    Returns:
        Dict[str, Any]: 测试结果
    """
    logger.info("开始测试Redis基本操作...")
    result = {
        "success": False,
        "message": "",
        "operations": {}
    }
    
    try:
        redis = get_redis_connection()
        
        # 测试SET操作
        set_key = f"test:set:{random_string()}"
        set_value = f"value-{random_string()}"
        set_start = time.time()
        set_result = redis.set(set_key, set_value, ex=60)
        set_time = time.time() - set_start
        
        result["operations"]["set"] = {
            "success": set_result,
            "time_ms": set_time * 1000
        }
        
        # 测试GET操作
        get_start = time.time()
        get_value = redis.get(set_key)
        get_time = time.time() - get_start
        
        result["operations"]["get"] = {
            "success": get_value == set_value,
            "time_ms": get_time * 1000
        }
        
        # 测试DELETE操作
        del_start = time.time()
        del_result = redis.delete(set_key)
        del_time = time.time() - del_start
        
        result["operations"]["delete"] = {
            "success": del_result == 1,
            "time_ms": del_time * 1000
        }
        
        # 测试批量操作
        pipeline_start = time.time()
        pipe = redis.pipeline()
        batch_keys = [f"test:batch:{random_string()}" for _ in range(10)]
        
        for i, key in enumerate(batch_keys):
            pipe.set(key, f"batch-value-{i}", ex=60)
        
        pipe.execute()
        pipeline_time = time.time() - pipeline_start
        
        result["operations"]["pipeline"] = {
            "success": True,
            "time_ms": pipeline_time * 1000
        }
        
        # 测试列表操作
        list_key = f"test:list:{random_string()}"
        list_start = time.time()
        redis.lpush(list_key, *[f"item-{i}" for i in range(5)])
        list_items = redis.lrange(list_key, 0, -1)
        redis.delete(list_key)
        list_time = time.time() - list_start
        
        result["operations"]["list"] = {
            "success": len(list_items) == 5,
            "time_ms": list_time * 1000
        }
        
        # 测试哈希操作
        hash_key = f"test:hash:{random_string()}"
        hash_start = time.time()
        redis.hset(hash_key, mapping={f"field-{i}": f"value-{i}" for i in range(5)})
        hash_data = redis.hgetall(hash_key)
        redis.delete(hash_key)
        hash_time = time.time() - hash_start
        
        result["operations"]["hash"] = {
            "success": len(hash_data) == 5,
            "time_ms": hash_time * 1000
        }
        
        # 清理测试数据
        for key in batch_keys:
            redis.delete(key)
        
        result["success"] = all(op["success"] for op in result["operations"].values())
        result["message"] = "基本操作测试完成"
        result["avg_operation_time_ms"] = sum(op["time_ms"] for op in result["operations"].values()) / len(result["operations"])
        
    except Exception as e:
        result["message"] = f"测试基本操作时发生错误: {str(e)}"
        logger.error(result["message"], exc_info=True)
    
    return result


def test_cache_performance(
    iterations: int = 1000, 
    data_size: int = 1024,
    ttl: int = 60
) -> Dict[str, Any]:
    """
    测试缓存性能
    
    Args:
        iterations (int): 测试迭代次数
        data_size (int): 测试数据大小（字节）
        ttl (int): 缓存TTL（秒）
        
    Returns:
        Dict[str, Any]: 测试结果
    """
    logger.info(f"开始性能测试: {iterations}次迭代, 数据大小: {data_size}字节, TTL: {ttl}秒")
    result = {
        "success": False,
        "message": "",
        "config": {
            "iterations": iterations,
            "data_size": data_size,
            "ttl": ttl
        },
        "results": {}
    }
    
    try:
        redis = get_redis_connection()
        cache_manager = CacheManager(prefix="test")
        
        # 生成测试数据
        test_data = {
            "id": random_string(8),
            "name": random_string(16),
            "description": random_string(data_size // 4),
            "tags": [random_string(8) for _ in range(10)],
            "metadata": {
                f"key-{i}": random_string(16) for i in range(20)
            },
            "payload": random_string(data_size // 2)
        }
        
        serialized_data = json.dumps(test_data)
        data_size_actual = len(serialized_data.encode('utf-8'))
        result["config"]["actual_data_size"] = data_size_actual
        
        # 测试写入性能
        write_times = []
        write_start = time.time()
        
        for i in range(iterations):
            key = f"perf:write:{random_string()}"
            start = time.time()
            cache_manager.set(key, test_data, ttl=ttl)
            write_times.append((time.time() - start) * 1000)  # 毫秒
        
        write_total = time.time() - write_start
        
        # 测试读取性能
        read_keys = [f"perf:read:{random_string()}" for _ in range(iterations)]
        for key in read_keys:
            cache_manager.set(key, test_data, ttl=ttl)
        
        read_times = []
        read_start = time.time()
        
        for key in read_keys:
            start = time.time()
            value = cache_manager.get(key)
            read_times.append((time.time() - start) * 1000)  # 毫秒
        
        read_total = time.time() - read_start
        
        # 测试删除性能
        delete_times = []
        delete_start = time.time()
        
        for key in read_keys:
            start = time.time()
            cache_manager.delete(key)
            delete_times.append((time.time() - start) * 1000)  # 毫秒
        
        delete_total = time.time() - delete_start
        
        # 计算统计数据
        result["results"] = {
            "write": {
                "total_time_ms": write_total * 1000,
                "avg_time_ms": sum(write_times) / len(write_times),
                "min_time_ms": min(write_times),
                "max_time_ms": max(write_times),
                "ops_per_second": iterations / write_total
            },
            "read": {
                "total_time_ms": read_total * 1000,
                "avg_time_ms": sum(read_times) / len(read_times),
                "min_time_ms": min(read_times),
                "max_time_ms": max(read_times),
                "ops_per_second": iterations / read_total
            },
            "delete": {
                "total_time_ms": delete_total * 1000,
                "avg_time_ms": sum(delete_times) / len(delete_times),
                "min_time_ms": min(delete_times),
                "max_time_ms": max(delete_times),
                "ops_per_second": iterations / delete_total
            }
        }
        
        result["success"] = True
        result["message"] = "性能测试完成"
        
    except Exception as e:
        result["message"] = f"性能测试时发生错误: {str(e)}"
        logger.error(result["message"], exc_info=True)
    
    return result


def run_all_tests() -> Dict[str, Any]:
    """
    运行所有缓存测试
    
    Returns:
        Dict[str, Any]: 测试结果
    """
    results = {
        "timestamp": time.time(),
        "connection": test_connection(),
        "basic_operations": test_basic_operations(),
        "performance": test_cache_performance(iterations=100)  # 减少迭代次数，以免测试时间过长
    }
    
    return results


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    print(json.dumps(run_all_tests(), indent=2)) 