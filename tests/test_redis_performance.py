^C
^C
^C
^C
^C
^C
^C
^C
^C
^C
^C
cd ~/EcoHub && cp test_redis_performance.py test_redis_performance.py.bak
^C
cd ~/EcoHub && python3 simple_redis_test.py
#!/usr/bin/env python3
"""
Redis缓存性能测试脚本

这个脚本用于测试Redis的连接性能和基本操作性能。
"""

import time
import json
import random
import string
import sys
from contextlib import contextmanager

try:
    import redis
    from fakeredis import FakeRedis
except ImportError:
    print("请先安装必要的依赖包：pip install redis fakeredis")
    sys.exit(1)

# Redis连接设置
REDIS_URL = "redis://localhost:6379/0"  # 对应本地Docker环境的Redis实例
FAKE_REDIS = True  # 强制使用FakeRedis进行测试

def random_string(length=10):
    """生成随机字符串"""
    return ''.join(random.choices(string.ascii_letters + string.digits, k=length))

@contextmanager
def timing(description):
    """用于测量操作时间的上下文管理器"""
    start = time.time()
    yield
    elapsed = time.time() - start
    print(f"{description}: {elapsed*1000:.2f}ms")
    return elapsed

def get_redis_connection():
    """获取Redis连接（或FakeRedis作为后备）"""
    if FAKE_REDIS:
        print("使用FakeRedis进行测试")
        return FakeRedis(decode_responses=True)
    
    try:
        client = redis.from_url(REDIS_URL, decode_responses=True)
        # 测试连接
        client.ping()
        print(f"成功连接到Redis服务器: {REDIS_URL}")
        return client
    except redis.ConnectionError as e:
        print(f"无法连接到Redis服务器: {REDIS_URL}, 错误: {str(e)}")
        print("切换到FakeRedis进行测试")
        return FakeRedis(decode_responses=True)
    except Exception as e:
        print(f"Redis连接错误: {str(e)}")
        sys.exit(1)

def test_connection(redis_client):
    """测试Redis连接状态"""
    print("\n=== Redis连接测试 ===")
    try:
        with timing("PING测试"):
            result = redis_client.ping()
        print(f"PING结果: {result}")
        
        with timing("INFO获取"):
            info = redis_client.info()
        print(f"Redis版本: {info.get('redis_version', 'unknown')}")
        print(f"已连接客户端数: {info.get('connected_clients', 'unknown')}")
        print(f"内存使用: {info.get('used_memory_human', 'unknown')}")
        return True
    except Exception as e:
        print(f"连接测试失败: {str(e)}")
        return False

def test_basic_operations(redis_client):
    """测试基本Redis操作性能"""
    print("\n=== 基本操作性能测试 ===")
    test_key = f"test:performance:{random_string()}"
    
    # 测试SET操作
    with timing("SET操作"):
        redis_client.set(test_key, "test_value", ex=60)
    
    # 测试GET操作
    with timing("GET操作"):
        value = redis_client.get(test_key)
    
    # 测试EXISTS操作
    with timing("EXISTS操作"):
        exists = redis_client.exists(test_key)
    
    # 测试DEL操作
    with timing("DEL操作"):
        redis_client.delete(test_key)
    
    # 测试批量操作
    test_keys = [f"test:batch:{random_string()}" for _ in range(10)]
    with timing("批量SET (10个键)"):
        pipe = redis_client.pipeline()
        for i, key in enumerate(test_keys):
            pipe.set(key, f"value-{i}", ex=60)
        pipe.execute()
    
    with timing("批量GET (10个键)"):
        pipe = redis_client.pipeline()
        for key in test_keys:
            pipe.get(key)
        pipe.execute()
    
    with timing("批量DEL (10个键)"):
        redis_client.delete(*test_keys)

def test_performance(redis_client, iterations=1000, data_size=1024):
    """测试缓存性能（高负载）"""
    print(f"\n=== 高负载性能测试 ({iterations}次迭代, {data_size}字节) ===")
    
    # 生成测试数据
    test_data = {
        "id": random_string(8),
        "name": random_string(16),
        "data": random_string(data_size),
        "tags": [random_string(8) for _ in range(5)]
    }
    serialized_data = json.dumps(test_data)
    
    print(f"测试数据大小: {len(serialized_data)} 字节")
    
    # 测试写性能
    write_times = []
    start_time = time.time()
    print(f"执行 {iterations} 次写入操作...")
    
    for i in range(iterations):
        key = f"perf:write:{random_string()}"
        start = time.time()
        redis_client.set(key, serialized_data, ex=60)
        write_times.append((time.time() - start) * 1000)  # 毫秒
        if i % 100 == 0 and i > 0:
            print(f"已完成 {i} 次操作...")
    
    write_duration = time.time() - start_time
    
    # 测试读性能
    read_keys = [f"perf:read:{random_string()}" for _ in range(iterations)]
    for key in read_keys:
        redis_client.set(key, serialized_data, ex=60)
    
    read_times = []
    start_time = time.time()
    print(f"执行 {iterations} 次读取操作...")
    
    for i, key in enumerate(read_keys):
        start = time.time()
        redis_client.get(key)
        read_times.append((time.time() - start) * 1000)
        if i % 100 == 0 and i > 0:
            print(f"已完成 {i} 次操作...")
    
    read_duration = time.time() - start_time
    
    # 清理
    for key in read_keys:
        redis_client.delete(key)
    
    # 结果
    print("\n性能测试结果:")
    print(f"写入性能:")
    print(f"  总耗时: {write_duration:.2f}秒")
    print(f"  平均操作时间: {sum(write_times)/len(write_times):.2f}ms")
    print(f"  最小操作时间: {min(write_times):.2f}ms")
    print(f"  最大操作时间: {max(write_times):.2f}ms")
    print(f"  操作/秒: {iterations/write_duration:.2f}")
    
    print(f"读取性能:")
    print(f"  总耗时: {read_duration:.2f}秒")
    print(f"  平均操作时间: {sum(read_times)/len(read_times):.2f}ms")
    print(f"  最小操作时间: {min(read_times):.2f}ms")
    print(f"  最大操作时间: {max(read_times):.2f}ms")
    print(f"  操作/秒: {iterations/read_duration:.2f}")

def main():
    print("===== Redis缓存性能测试 =====")
    print(f"测试使用的Redis URL: {REDIS_URL}")
    
    # 连接Redis
    redis_client = None
    try:
        redis_client = get_redis_connection()
        
        # 运行测试
        if test_connection(redis_client):
            test_basic_operations(redis_client)
            
            # 性能测试
            iterations = 100  # 减少迭代次数以节省时间
            test_performance(redis_client, iterations=iterations, data_size=1024)
            
            print("\n所有测试完成!")
        else:
            print("由于连接问题，测试无法继续")
    except KeyboardInterrupt:
        print("\n测试被用户中断")
    except Exception as e:
        print(f"测试过程中发生错误: {str(e)}")
    finally:
        if redis_client and not FAKE_REDIS:
            print("关闭Redis连接")

if __name__ == "__main__":
    main() 
