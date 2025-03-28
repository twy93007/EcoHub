"""
用户路由模块

处理用户相关的API请求。
"""
from flask import Blueprint, request, jsonify
from gateway.middleware.auth import token_required
from gateway.middleware.permissions import permission_required

# 创建蓝图
bp = Blueprint('user', __name__, url_prefix='/api/user')

@bp.route('/profile', methods=['GET'])
@token_required
def get_current_user():
    """获取当前用户信息"""
    # 在token_required装饰器中已经验证了令牌
    # 这里可以根据令牌中的用户ID获取用户信息
    user_id = request.current_user.get('user_id')
    role = request.current_user.get('role')
    
    # 这里应该连接到用户服务来获取用户信息
    # 为了演示，我们假设获取成功
    # TODO: 实现实际的用户信息获取
    
    return jsonify({
        'status': 'success',
        'data': {
            'user': {
                'id': user_id,
                'username': 'admin',  # 模拟数据
                'email': 'admin@example.com',  # 模拟数据
                'role': role,
                'created_at': '2023-01-01T00:00:00Z'  # 模拟数据
            }
        }
    }), 200

@bp.route('/activities', methods=['GET'])
@token_required
def get_user_activities():
    """获取用户活动记录"""
    # 这里应该连接到用户服务来获取用户活动记录
    # 为了演示，我们返回模拟数据
    activities = [
        {
            'id': 1,
            'type': 'login',
            'description': '用户登录',
            'created_at': '2023-03-26T06:08:37Z',
            'ip_address': '192.168.1.100',
            'location': '北京市',
            'device': 'Chrome 91.0.4472.124 / Windows 10',
            'status': 'success'
        },
        {
            'id': 2,
            'type': 'login',
            'description': '用户登录',
            'created_at': '2023-03-25T15:30:00Z',
            'ip_address': '192.168.1.101',
            'location': '上海市',
            'device': 'Firefox 89.0 / macOS 11.4',
            'status': 'success'
        },
        {
            'id': 3,
            'type': 'login_failed',
            'description': '登录失败',
            'created_at': '2023-03-25T15:25:00Z',
            'ip_address': '192.168.1.102',
            'location': '广州市',
            'device': 'Safari 14.1 / iOS 14.6',
            'status': 'failed',
            'reason': '密码错误'
        }
    ]
    
    return jsonify({
        'status': 'success',
        'data': {
            'activities': activities
        }
    }), 200

@bp.route('/', methods=['GET'])
@permission_required('user', 'read')
def get_users():
    """获取用户列表"""
    # 这里应该连接到用户服务来获取用户列表
    # 为了演示，我们假设获取成功
    # TODO: 实现实际的用户列表获取
    
    # 模拟用户列表
    users = [
        {
            'id': 1,
            'username': 'admin',
            'email': 'admin@example.com',
            'role': 'admin',
            'created_at': '2023-01-01T00:00:00Z'
        },
        {
            'id': 2,
            'username': 'manager',
            'email': 'manager@example.com',
            'role': 'manager',
            'created_at': '2023-01-01T00:00:00Z'
        },
        {
            'id': 3,
            'username': 'user',
            'email': 'user@example.com',
            'role': 'user',
            'created_at': '2023-01-01T00:00:00Z'
        }
    ]
    
    return jsonify({
        'status': 'success',
        'data': {
            'users': users
        }
    }), 200

@bp.route('/<int:user_id>', methods=['GET'])
@permission_required('user', 'read')
def get_user(user_id):
    """获取指定用户信息"""
    # 这里应该连接到用户服务来获取用户信息
    # 为了演示，我们假设获取成功
    # TODO: 实现实际的用户信息获取
    
    return jsonify({
        'status': 'success',
        'data': {
            'user': {
                'id': user_id,
                'username': f'user{user_id}',  # 模拟数据
                'email': f'user{user_id}@example.com',  # 模拟数据
                'role': 'user',  # 模拟数据
                'created_at': '2023-01-01T00:00:00Z'  # 模拟数据
            }
        }
    }), 200

@bp.route('/', methods=['POST'])
@permission_required('user', 'create')
def create_user():
    """创建用户"""
    if not request.is_json:
        return jsonify({
            'status': 'error',
            'message': '请求必须是JSON格式'
        }), 400
    
    data = request.get_json()
    
    # 检查必要字段
    required_fields = ['username', 'email', 'password', 'role']
    for field in required_fields:
        if field not in data:
            return jsonify({
                'status': 'error',
                'message': f'{field}为必填项'
            }), 400
    
    # 这里应该连接到用户服务来创建用户
    # 为了演示，我们假设创建成功
    # TODO: 实现实际的用户创建
    
    return jsonify({
        'status': 'success',
        'message': '用户创建成功',
        'data': {
            'user': {
                'id': 4,  # 模拟ID
                'username': data['username'],
                'email': data['email'],
                'role': data['role'],
                'created_at': '2023-03-01T00:00:00Z'  # 模拟数据
            }
        }
    }), 201

@bp.route('/<int:user_id>', methods=['PUT'])
@permission_required('user', 'update')
def update_user(user_id):
    """更新用户信息"""
    if not request.is_json:
        return jsonify({
            'status': 'error',
            'message': '请求必须是JSON格式'
        }), 400
    
    data = request.get_json()
    
    # 这里应该连接到用户服务来更新用户信息
    # 为了演示，我们假设更新成功
    # TODO: 实现实际的用户信息更新
    
    return jsonify({
        'status': 'success',
        'message': '用户信息更新成功',
        'data': {
            'user': {
                'id': user_id,
                'username': data.get('username', f'user{user_id}'),
                'email': data.get('email', f'user{user_id}@example.com'),
                'role': data.get('role', 'user'),
                'updated_at': '2023-03-22T00:00:00Z'  # 模拟数据
            }
        }
    }), 200

@bp.route('/<int:user_id>', methods=['DELETE'])
@permission_required('user', 'delete')
def delete_user(user_id):
    """删除用户"""
    # 这里应该连接到用户服务来删除用户
    # 为了演示，我们假设删除成功
    # TODO: 实现实际的用户删除
    
    return jsonify({
        'status': 'success',
        'message': f'用户ID {user_id} 已成功删除'
    }), 200 