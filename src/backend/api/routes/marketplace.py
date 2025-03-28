"""
数据集市路由模块

处理数据集市相关的API请求。
"""
from flask import Blueprint, jsonify
from gateway.middleware.auth import token_required

# 创建蓝图
bp = Blueprint('marketplace', __name__, url_prefix='/api/marketplace')

@bp.route('/', methods=['GET'])
@token_required
def get_marketplace_list():
    """获取数据产品列表"""
    return jsonify({
        'status': 'success',
        'message': '集市服务路由已设置',
        'data': []  # 将来会从集市服务获取实际数据
    }), 200 