"""
身份验证中间件

提供JWT令牌验证和权限检查功能。
"""
from flask import request, jsonify, current_app
from functools import wraps
import jwt
from datetime import datetime, timedelta

def generate_token(user_id, role, expiration_delta=None):
    """生成JWT令牌

    Args:
        user_id: 用户ID
        role: 用户角色
        expiration_delta: 过期时间增量（可选）

    Returns:
        str: JWT令牌
    """
    # 获取配置中的密钥和过期时间
    secret_key = current_app.config.get('JWT_SECRET_KEY', 'default-jwt-secret')
    expires_in = current_app.config.get('JWT_ACCESS_TOKEN_EXPIRES', 3600)  # 默认1小时
    
    # 如果提供了自定义过期时间，则使用自定义过期时间
    if expiration_delta:
        expires_in = expiration_delta.total_seconds()
    
    # 创建有效载荷
    payload = {
        'user_id': user_id,
        'role': role,
        'exp': datetime.utcnow() + timedelta(seconds=expires_in),
        'iat': datetime.utcnow(),
    }
    
    # 编码令牌
    token = jwt.encode(payload, secret_key, algorithm='HS256')
    
    return token

def token_required(f):
    """验证JWT令牌的装饰器

    Args:
        f: 要装饰的函数

    Returns:
        decorated_function: 装饰后的函数
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = None
        
        # 从Authorization头中获取令牌
        auth_header = request.headers.get('Authorization')
        if auth_header:
            if auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]
        
        if not token:
            return jsonify({
                'status': 'error',
                'message': '缺少访问令牌'
            }), 401
        
        try:
            # 解码令牌
            secret_key = current_app.config.get('JWT_SECRET_KEY', 'default-jwt-secret')
            payload = jwt.decode(token, secret_key, algorithms=['HS256'])
            
            # 将用户信息添加到请求中
            request.current_user = {
                'user_id': payload['user_id'],
                'role': payload['role']
            }
            
        except jwt.ExpiredSignatureError:
            return jsonify({
                'status': 'error',
                'message': '令牌已过期'
            }), 401
        except jwt.InvalidTokenError:
            return jsonify({
                'status': 'error',
                'message': '无效的令牌'
            }), 401
        
        return f(*args, **kwargs)
    
    return decorated_function

def role_required(roles):
    """检查用户角色的装饰器

    Args:
        roles: 单个角色字符串或角色列表

    Returns:
        decorator: 角色检查装饰器
    """
    def decorator(f):
        @wraps(f)
        @token_required
        def decorated_function(*args, **kwargs):
            # 获取当前用户角色
            current_role = request.current_user.get('role')
            
            # 检查角色是否符合要求
            if isinstance(roles, str) and current_role != roles:
                return jsonify({
                    'status': 'error',
                    'message': '权限不足'
                }), 403
            elif isinstance(roles, list) and current_role not in roles:
                return jsonify({
                    'status': 'error',
                    'message': '权限不足'
                }), 403
            
            return f(*args, **kwargs)
        
        return decorated_function
    
    return decorator

def refresh_token_required(f):
    """验证刷新令牌的装饰器

    Args:
        f: 要装饰的函数

    Returns:
        decorated_function: 装饰后的函数
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not request.is_json:
            return jsonify({
                'status': 'error',
                'message': '请求必须是JSON格式'
            }), 400
        
        data = request.get_json()
        refresh_token = data.get('refresh_token')
        
        if not refresh_token:
            return jsonify({
                'status': 'error',
                'message': '缺少刷新令牌'
            }), 401
        
        # 这里应该验证刷新令牌，例如从数据库中查询
        # 为了演示，我们假设刷新令牌有效
        # TODO: 实现实际的刷新令牌验证
        
        # 模拟验证刷新令牌
        if refresh_token:
            # 将用户信息添加到请求中
            request.current_user = {
                'user_id': 1,
                'role': 'admin'
            }
            
            return f(*args, **kwargs)
        
        return jsonify({
            'status': 'error',
            'message': '刷新令牌无效'
        }), 401
    
    return decorated_function 