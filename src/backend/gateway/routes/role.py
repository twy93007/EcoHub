"""
角色管理路由模块

处理角色相关的API请求。
"""
from flask import Blueprint, jsonify, request
from gateway.models import Role
from gateway.middleware.auth import token_required
from gateway.middleware.permissions import permission_required, get_user_permissions

# 创建蓝图
bp = Blueprint('role', __name__, url_prefix='/api/roles')

@bp.route('/', methods=['GET'])
@token_required
def get_roles():
    """获取所有角色"""
    # 获取所有角色
    roles = Role.get_all_roles()
    
    # 转换为字典列表
    roles_data = [role.to_dict() for role in roles]
    
    return jsonify({
        'status': 'success',
        'message': '获取角色列表成功',
        'data': {
            'roles': roles_data
        }
    }), 200

@bp.route('/<role_code>', methods=['GET'])
@token_required
def get_role(role_code):
    """获取特定角色"""
    # 检查角色是否存在
    if not Role.is_valid_role(role_code):
        return jsonify({
            'status': 'error',
            'message': '角色不存在'
        }), 404
    
    # 获取角色
    role = Role.from_code(role_code)
    
    return jsonify({
        'status': 'success',
        'message': '获取角色成功',
        'data': {
            'role': role.to_dict()
        }
    }), 200

@bp.route('/<role_code>/permissions', methods=['GET'])
@token_required
def get_role_permissions(role_code):
    """获取特定角色的权限"""
    # 检查角色是否存在
    if not Role.is_valid_role(role_code):
        return jsonify({
            'status': 'error',
            'message': '角色不存在'
        }), 404
    
    # 获取角色权限
    permissions = get_user_permissions(role_code)
    
    return jsonify({
        'status': 'success',
        'message': '获取权限成功',
        'data': {
            'role': role_code,
            'permissions': permissions
        }
    }), 200

@bp.route('/me/permissions', methods=['GET'])
@token_required
def get_my_permissions():
    """获取当前用户的权限"""
    # 获取当前用户角色
    current_role = request.current_user.get('role')
    
    # 获取角色权限
    permissions = get_user_permissions(current_role)
    
    return jsonify({
        'status': 'success',
        'message': '获取权限成功',
        'data': {
            'role': current_role,
            'permissions': permissions
        }
    }), 200

# 以下API需要管理员权限

@bp.route('/', methods=['POST'])
@permission_required('setting', 'create')
def create_role():
    """创建角色（模拟API，实际环境中应连接到数据库）"""
    return jsonify({
        'status': 'error',
        'message': '此API仅用于演示，实际环境中应连接到数据库'
    }), 501

@bp.route('/<role_code>', methods=['PUT'])
@permission_required('setting', 'update')
def update_role(role_code):
    """更新角色（模拟API，实际环境中应连接到数据库）"""
    return jsonify({
        'status': 'error',
        'message': '此API仅用于演示，实际环境中应连接到数据库'
    }), 501

@bp.route('/<role_code>', methods=['DELETE'])
@permission_required('setting', 'delete')
def delete_role(role_code):
    """删除角色（模拟API，实际环境中应连接到数据库）"""
    return jsonify({
        'status': 'error',
        'message': '此API仅用于演示，实际环境中应连接到数据库'
    }), 501 