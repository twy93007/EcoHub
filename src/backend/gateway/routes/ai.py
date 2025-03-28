"""
AI辅助路由模块

处理AI辅助相关的API请求。
"""
from flask import Blueprint, jsonify
from gateway.middleware.auth import token_required

# 创建蓝图
bp = Blueprint('ai', __name__, url_prefix='/api/ai')

@bp.route('/', methods=['GET'])
@token_required
def get_ai_list():
    """获取AI服务列表"""
    return jsonify({
        'status': 'success',
        'message': 'AI服务路由已设置',
        'data': []  # 将来会从AI服务获取实际数据
    }), 200 