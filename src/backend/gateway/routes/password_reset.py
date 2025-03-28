"""
密码重置路由模块

处理用户密码重置相关的功能。
"""
from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta
import uuid
import random
import string
from gateway.middleware.auth import token_required

# 创建蓝图
bp = Blueprint('password', __name__, url_prefix='/api/auth/password')

# 模拟存储重置码的字典，生产环境中应该使用数据库存储
reset_codes = {}  # {email: {"code": "123456", "expires_at": datetime}}

def generate_reset_code(length=6):
    """生成随机的重置码"""
    return ''.join(random.choices(string.digits, k=length))

@bp.route('/forgot', methods=['POST'])
def forgot_password():
    """忘记密码接口，发送重置码"""
    if not request.is_json:
        return jsonify({
            'status': 'error',
            'message': '请求必须是JSON格式'
        }), 400

    data = request.get_json()
    email = data.get('email')

    if not email:
        return jsonify({
            'status': 'error',
            'message': '邮箱为必填项'
        }), 400

    # 生成6位数字的重置码
    reset_code = generate_reset_code()
    # 设置重置码15分钟后过期
    expires_at = datetime.utcnow() + timedelta(minutes=15)
    
    # 存储重置码 (在实际环境中应该存储在数据库中)
    reset_codes[email] = {
        'code': reset_code,
        'expires_at': expires_at
    }
    
    # 实际环境中应该发送邮件，包含重置码
    # TODO: 实现邮件发送功能
    
    # 为了安全，不管邮箱是否存在，都返回成功
    return jsonify({
        'status': 'success',
        'message': '重置码已发送至您的邮箱',
        'data': {
            # 在实际环境中，不应该返回重置码，这里仅用于演示
            'reset_code': reset_code,
            'expires_at': expires_at.isoformat()
        }
    }), 200

@bp.route('/verify', methods=['POST'])
def verify_reset_code():
    """验证重置码"""
    if not request.is_json:
        return jsonify({
            'status': 'error',
            'message': '请求必须是JSON格式'
        }), 400

    data = request.get_json()
    email = data.get('email')
    reset_code = data.get('reset_code')

    if not email or not reset_code:
        return jsonify({
            'status': 'error',
            'message': '邮箱和重置码为必填项'
        }), 400

    # 检查重置码是否存在且未过期
    if email not in reset_codes or reset_codes[email]['code'] != reset_code:
        return jsonify({
            'status': 'error',
            'message': '重置码无效'
        }), 400

    # 检查重置码是否过期
    if datetime.utcnow() > reset_codes[email]['expires_at']:
        del reset_codes[email]  # 清除过期的重置码
        return jsonify({
            'status': 'error',
            'message': '重置码已过期'
        }), 400

    # 生成临时令牌，用于密码重置
    temp_token = str(uuid.uuid4())
    
    return jsonify({
        'status': 'success',
        'message': '重置码验证成功',
        'data': {
            'temp_token': temp_token
        }
    }), 200

@bp.route('/reset', methods=['POST'])
def reset_password():
    """重置密码"""
    if not request.is_json:
        return jsonify({
            'status': 'error',
            'message': '请求必须是JSON格式'
        }), 400

    data = request.get_json()
    email = data.get('email')
    new_password = data.get('new_password')
    temp_token = data.get('temp_token')

    if not email or not new_password or not temp_token:
        return jsonify({
            'status': 'error',
            'message': '邮箱、新密码和临时令牌为必填项'
        }), 400

    # 检查邮箱是否有有效的重置码
    if email not in reset_codes:
        return jsonify({
            'status': 'error',
            'message': '无效的请求'
        }), 400

    # 在实际环境中，应该验证临时令牌
    # TODO: 实现临时令牌验证
    
    # 这里应该连接到用户服务来更新密码
    # 为了演示，我们假设更新成功
    # TODO: 实现实际的密码更新
    
    # 清除重置码
    del reset_codes[email]
    
    return jsonify({
        'status': 'success',
        'message': '密码重置成功'
    }), 200

@bp.route('/change', methods=['POST'])
@token_required
def change_password():
    """修改密码（需要用户已登录）"""
    if not request.is_json:
        return jsonify({
            'status': 'error',
            'message': '请求必须是JSON格式'
        }), 400

    data = request.get_json()
    old_password = data.get('old_password')
    new_password = data.get('new_password')

    if not old_password or not new_password:
        return jsonify({
            'status': 'error',
            'message': '旧密码和新密码为必填项'
        }), 400

    # 获取当前用户信息
    user_id = request.current_user.get('user_id')
    
    # 这里应该连接到用户服务来验证旧密码并更新密码
    # 为了演示，我们假设旧密码验证成功，并且更新成功
    # TODO: 实现实际的密码更新
    
    return jsonify({
        'status': 'success',
        'message': '密码修改成功'
    }), 200 