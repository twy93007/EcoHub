from flask import Blueprint, request, jsonify, redirect, url_for
from gateway.routes.auth import login as auth_login, register as auth_register

# 创建蓝图
bp = Blueprint('v1_compat', __name__, url_prefix='/api/v1')

@bp.route('/auth/login', methods=['POST'])
def login():
    # 直接调用原始的登录处理函数
    return auth_login()

@bp.route('/auth/register', methods=['POST'])
def register():
    # 直接调用原始的注册处理函数
    return auth_register()
