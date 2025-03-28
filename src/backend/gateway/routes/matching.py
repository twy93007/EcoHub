"""
数据匹配路由模块

处理数据匹配相关的API请求。
"""
from flask import Blueprint, jsonify
from gateway.middleware.auth import token_required

# 创建蓝图
bp = Blueprint('matching', __name__, url_prefix='/api/matching')

@bp.route('/', methods=['GET'])
@token_required
def get_matching_list():
    """获取匹配任务列表"""
    return jsonify({
        'status': 'success',
        'message': '匹配服务路由已设置',
        'data': []  # 将来会从匹配服务获取实际数据
    }), 200 