"""
Redis缓存测试API路由模块

提供用于测试和监控Redis缓存的API端点。
"""

import json
import time
from flask import Blueprint, jsonify, request, current_app

from common.cache import redis_client, cache
from common.cache.cache_test import (
    test_connection, 
    test_basic_operations, 
    test_cache_performance,
    run_all_tests
)
from common.cache.rate_limiter import rate_limit

# 创建蓝图
cache_test_bp = Blueprint('cache_test', __name__, url_prefix='/api/v1/cache')


@cache_test_bp.route('/status', methods=['GET'])
@rate_limit(limit=5, period=60)  # 限制访问频率
def cache_status():
    """获取Redis缓存状态"""
    try:
        result = test_connection()
        return jsonify(result)
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'缓存状态检查失败: {str(e)}'
        }), 500


@cache_test_bp.route('/operations', methods=['GET'])
@rate_limit(limit=2, period=60)  # 更严格的限制，因为这个操作更重
def cache_operations():
    """测试Redis基本操作"""
    try:
        result = test_basic_operations()
        return jsonify(result)
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'缓存操作测试失败: {str(e)}'
        }), 500


@cache_test_bp.route('/performance', methods=['GET'])
@rate_limit(limit=1, period=300)  # 非常严格的限制，因为性能测试消耗资源
def cache_performance():
    """测试Redis缓存性能"""
    try:
        # 获取请求参数
        iterations = request.args.get('iterations', default=100, type=int)
        data_size = request.args.get('data_size', default=1024, type=int)
        ttl = request.args.get('ttl', default=60, type=int)
        
        # 限制参数范围，防止资源滥用
        iterations = min(1000, max(10, iterations))
        data_size = min(10240, max(128, data_size))
        ttl = min(3600, max(1, ttl))
        
        result = test_cache_performance(
            iterations=iterations,
            data_size=data_size,
            ttl=ttl
        )
        return jsonify(result)
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'缓存性能测试失败: {str(e)}'
        }), 500


@cache_test_bp.route('/all', methods=['GET'])
@rate_limit(limit=1, period=600)  # 更严格的限制，因为这会运行所有测试
def all_tests():
    """运行所有缓存测试"""
    try:
        result = run_all_tests()
        return jsonify(result)
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'缓存测试失败: {str(e)}'
        }), 500


@cache_test_bp.route('/example', methods=['GET'])
@cache(ttl=30)  # 使用缓存装饰器，缓存30秒
def cache_example():
    """缓存装饰器示例端点"""
    # 模拟耗时操作
    time.sleep(1)
    
    return jsonify({
        'status': 'success',
        'message': '这是一个缓存示例响应',
        'timestamp': time.time(),
        'random': time.time() * 1000  # 这个值会被缓存，所以重复请求会看到相同的值
    })


@cache_test_bp.route('/stats', methods=['GET'])
def cache_stats():
    """获取Redis缓存统计信息"""
    try:
        info = redis_client.info()
        
        stats = {
            'server': {
                'redis_version': info.get('redis_version'),
                'uptime_in_seconds': info.get('uptime_in_seconds'),
                'uptime_in_days': info.get('uptime_in_days')
            },
            'clients': {
                'connected_clients': info.get('connected_clients'),
                'blocked_clients': info.get('blocked_clients')
            },
            'memory': {
                'used_memory_human': info.get('used_memory_human'),
                'used_memory_peak_human': info.get('used_memory_peak_human'),
                'mem_fragmentation_ratio': info.get('mem_fragmentation_ratio')
            },
            'stats': {
                'total_connections_received': info.get('total_connections_received'),
                'total_commands_processed': info.get('total_commands_processed'),
                'instantaneous_ops_per_sec': info.get('instantaneous_ops_per_sec'),
                'expired_keys': info.get('expired_keys'),
                'evicted_keys': info.get('evicted_keys'),
                'keyspace_hits': info.get('keyspace_hits'),
                'keyspace_misses': info.get('keyspace_misses'),
                'hit_rate': info.get('keyspace_hits', 0) / (info.get('keyspace_hits', 0) + info.get('keyspace_misses', 1)) * 100 if (info.get('keyspace_hits', 0) + info.get('keyspace_misses', 0)) > 0 else 0
            },
            'keyspace': {}
        }
        
        # 添加数据库键空间信息
        for key in info:
            if key.startswith('db'):
                stats['keyspace'][key] = info[key]
        
        return jsonify({
            'status': 'success',
            'stats': stats
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'获取缓存统计信息失败: {str(e)}'
        }), 500


@cache_test_bp.route('/flush', methods=['POST'])
@rate_limit(limit=1, period=300)  # 严格限制，因为这会清空缓存
def flush_cache():
    """清空缓存（仅限于开发环境使用）"""
    try:
        # 检查是否在开发环境中
        if current_app.config.get('FLASK_ENV') != 'development':
            return jsonify({
                'status': 'error',
                'message': '此操作仅在开发环境中可用'
            }), 403
        
        # 清空当前数据库
        redis_client.flushdb()
        
        return jsonify({
            'status': 'success',
            'message': '缓存已清空'
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'清空缓存失败: {str(e)}'
        }), 500 