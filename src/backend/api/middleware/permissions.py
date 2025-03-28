"""
权限中间件

提供基于角色的权限控制和权限检查功能。
"""
from flask import request, jsonify, current_app
from functools import wraps
from .auth import token_required

# 定义角色层次结构
ROLE_HIERARCHY = {
    'admin': ['admin', 'manager', 'user', 'guest'],  # 管理员拥有所有权限
    'manager': ['manager', 'user', 'guest'],         # 经理拥有除管理员外的所有权限
    'user': ['user', 'guest'],                       # 普通用户拥有用户和访客权限
    'guest': ['guest']                               # 访客只有访客权限
}

# 定义资源权限
RESOURCE_PERMISSIONS = {
    'user': {
        'create': ['admin', 'manager'],
        'read': ['admin', 'manager', 'user'],
        'update': ['admin', 'manager'],
        'delete': ['admin']
    },
    'data': {
        'create': ['admin', 'manager', 'user'],
        'read': ['admin', 'manager', 'user', 'guest'],
        'update': ['admin', 'manager', 'user'],
        'delete': ['admin', 'manager']
    },
    'report': {
        'create': ['admin', 'manager', 'user'],
        'read': ['admin', 'manager', 'user', 'guest'],
        'update': ['admin', 'manager', 'user'],
        'delete': ['admin', 'manager']
    },
    'setting': {
        'create': ['admin'],
        'read': ['admin', 'manager'],
        'update': ['admin'],
        'delete': ['admin']
    }
}

def check_permission(role, resource, action):
    """检查用户是否有权限执行特定操作

    Args:
        role: 用户角色
        resource: 资源类型
        action: 操作类型 (create, read, update, delete)

    Returns:
        bool: 是否有权限
    """
    # 检查资源是否存在
    if resource not in RESOURCE_PERMISSIONS:
        return False
    
    # 检查操作是否存在
    if action not in RESOURCE_PERMISSIONS[resource]:
        return False
    
    # 检查角色是否存在于角色层次结构中
    if role not in ROLE_HIERARCHY:
        return False
    
    # 获取允许执行此操作的角色列表
    allowed_roles = RESOURCE_PERMISSIONS[resource][action]
    
    # 检查角色是否在允许列表中
    for allowed_role in allowed_roles:
        if allowed_role in ROLE_HIERARCHY[role]:
            return True
    
    return False

def permission_required(resource, action):
    """验证用户是否有权限执行特定操作的装饰器

    Args:
        resource: 资源类型
        action: 操作类型 (create, read, update, delete)

    Returns:
        decorator: 权限检查装饰器
    """
    def decorator(f):
        @wraps(f)
        @token_required  # 确保用户已认证
        def decorated_function(*args, **kwargs):
            # 获取当前用户角色
            current_role = request.current_user.get('role')
            
            # 检查是否有权限
            if not check_permission(current_role, resource, action):
                return jsonify({
                    'status': 'error',
                    'message': f'您没有权限执行此操作：{action} {resource}'
                }), 403
            
            return f(*args, **kwargs)
        
        return decorated_function
    
    return decorator

def get_user_permissions(role):
    """获取特定角色的所有权限

    Args:
        role: 用户角色

    Returns:
        dict: 用户权限字典
    """
    # 检查角色是否存在
    if role not in ROLE_HIERARCHY:
        return {}
    
    # 获取用户可以扮演的所有角色
    user_roles = ROLE_HIERARCHY[role]
    
    # 初始化权限字典
    permissions = {}
    
    # 遍历所有资源和操作，检查用户是否有权限
    for resource, actions in RESOURCE_PERMISSIONS.items():
        permissions[resource] = {}
        for action, allowed_roles in actions.items():
            # 如果用户的任何角色在允许列表中，则有权限
            has_permission = any(r in allowed_roles for r in user_roles)
            permissions[resource][action] = has_permission
    
    return permissions 