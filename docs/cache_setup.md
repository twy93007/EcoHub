# Redis缓存配置和使用文档

## 概述

本文档介绍了EcoHub项目中Redis缓存的配置和使用方法。Redis用于提供高性能的缓存服务，减轻数据库负载，提高API响应速度。

## 配置详情

### Redis服务配置

Redis服务器在Docker环境中运行，配置如下：

- **Redis版本**: 6.x
- **容器端口**: 6379
- **数据持久化**: 启用RDB持久化
- **内存策略**: LRU（最近最少使用）淘汰策略
- **最大内存**: 256MB
- **管理工具**: Redis Commander (http://localhost:8082)

### 自定义Redis配置

我们使用自定义配置文件`redis.conf`，位于`src/backend/database/init/redis.conf`，主要配置包括：

- 网络配置：监听所有网络接口，保持默认端口
- 内存管理：设置最大内存限制和淘汰策略
- 持久化：配置RDB快照保存策略
- 性能优化：调整哈希、列表等数据结构的压缩阈值

### 缓存中间件

缓存功能通过以下组件实现：

1. **Redis客户端**：提供与Redis服务器的基本连接功能
2. **缓存管理器**：提供高级缓存操作API
3. **缓存中间件**：自动为API响应提供缓存功能
4. **速率限制**：使用Redis实现API访问频率控制

## 使用指南

### 基本缓存操作

```python
from common.cache import redis_client

# 设置缓存
redis_client.set("my_key", "my_value", ex=3600)  # 有效期1小时

# 获取缓存
value = redis_client.get("my_key")

# 删除缓存
redis_client.delete("my_key")
```

### 使用缓存管理器

```python
from common.cache import CacheManager

# 创建缓存管理器实例
cache_manager = CacheManager(prefix="myapp", default_ttl=1800)

# 设置缓存
cache_manager.set("user:profile:123", user_data)

# 获取缓存
user_data = cache_manager.get("user:profile:123")

# 检查缓存是否存在
exists = cache_manager.exists("user:profile:123")

# 删除缓存
cache_manager.delete("user:profile:123")

# 按模式清除缓存
cache_manager.clear_pattern("user:profile:*")
```

### 使用缓存装饰器

```python
from common.cache import cache

# 缓存函数结果（默认1小时）
@cache()
def get_user_data(user_id):
    # 耗时的数据库查询...
    return user_data

# 自定义缓存时间（5分钟）
@cache(ttl=300)
def get_weather_data(city):
    # 外部API调用...
    return weather_data

# 清除特定函数的缓存
get_user_data.clear_cache()
```

### API响应缓存

所有GET请求的API响应将自动被缓存，除非：

1. 请求路径以`/api/v1/auth`、`/api/v1/admin`等开头
2. 请求头包含`Cache-Control: no-cache`或`Cache-Control: no-store`
3. 响应状态码不是200

缓存时间根据路径类型自动确定，详见`common/cache/config.py`中的`TTL_CONFIG`。

### 速率限制

```python
from common.cache.rate_limiter import rate_limit

# 限制每分钟最多允许10个请求
@rate_limit(limit=10, period=60)
def my_api_endpoint():
    # API处理逻辑...
    return response
```

## 缓存测试

我们提供了一套API端点用于测试和监控Redis缓存：

- `/api/v1/cache/status` - 检查Redis连接状态
- `/api/v1/cache/operations` - 测试基本缓存操作
- `/api/v1/cache/performance` - 测试缓存性能
- `/api/v1/cache/stats` - 查看Redis统计信息
- `/api/v1/cache/example` - 缓存装饰器示例
- `/api/v1/cache/flush` - 清空缓存（仅开发环境）

## 最佳实践

1. **缓存键命名**：使用一致的命名模式，如`type:id:attribute`
2. **适当的TTL**：为不同类型的数据设置合适的过期时间
3. **缓存失效**：在数据变更时主动使相关缓存失效
4. **避免缓存穿透**：对不存在的数据也设置短期缓存
5. **数据压缩**：对大型数据考虑使用压缩存储

## 性能监控

建议定期监控以下Redis指标：

- 内存使用情况
- 缓存命中率
- 连接数量
- 操作延迟
- 过期/淘汰的键数量

## 故障排除

常见问题和解决方案：

1. **连接超时**：检查网络设置和Redis服务状态
2. **内存溢出**：调整最大内存限制或优化缓存策略
3. **键冲突**：确保缓存键使用唯一命名
4. **性能下降**：检查Redis服务器负载和网络延迟

## 参考资料

- [Redis官方文档](https://redis.io/documentation)
- [Redis Python客户端](https://github.com/redis/redis-py)
- [Redis命令参考](https://redis.io/commands) 