"""
数据分析路由模块

处理数据分析相关的API请求。
"""
from flask import Blueprint, jsonify
from gateway.middleware.auth import token_required

# 创建蓝图
bp = Blueprint('analysis', __name__, url_prefix='/api/analysis')

@bp.route('/', methods=['GET'])
@token_required
def get_analysis_list():
    """获取分析任务列表"""
    return jsonify({
        'status': 'success',
        'message': '分析服务路由已设置',
        'data': []  # 将来会从分析服务获取实际数据
    }), 200 