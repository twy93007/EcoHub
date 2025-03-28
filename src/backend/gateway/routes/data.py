"""
数据路由模块

处理数据管理相关的API请求。
"""
from flask import Blueprint, jsonify
from gateway.middleware.auth import token_required

# 创建蓝图
bp = Blueprint('data', __name__, url_prefix='/api/data')

@bp.route('/', methods=['GET'])
@token_required
def get_data_list():
    """获取数据列表"""
    return jsonify({
        'status': 'success',
        'message': '数据服务路由已设置',
        'data': []  # 将来会从数据服务获取实际数据
    }), 200 