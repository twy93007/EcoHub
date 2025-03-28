"""
身份验证路由模块

处理用户登录、注册、令牌刷新和注销功能。
"""
from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta
import os
import uuid
import bcrypt
import psycopg2
from psycopg2 import pool

# 从中间件导入身份验证函数
from gateway.middleware.auth import generate_token, token_required, refresh_token_required

# 数据库连接池
db_pool = psycopg2.pool.SimpleConnectionPool(
    1, 10,
    host="db",
    database="ecohub",
    user="postgres",
    password="postgres"
)

# 创建蓝图
bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@bp.route('/login', methods=['POST'])
def login():
    """用户登录接口，验证凭据并返回访问令牌和刷新令牌"""
    if not request.is_json:
        return jsonify({
            'status': 'error',
            'message': '请求必须是JSON格式'
        }), 400

    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({
            'status': 'error',
            'message': '用户名和密码为必填项'
        }), 400

    # 连接数据库验证用户
    conn = db_pool.getconn()
    try:
        cursor = conn.cursor()
        # 查询用户信息
        cursor.execute(
            "SELECT user_id, username, password_hash, role FROM users WHERE username = %s",
            (username,)
        )
        user = cursor.fetchone()
        cursor.close()
        
        if user and bcrypt.checkpw(password.encode('utf-8'), user[2].encode('utf-8')):
            # 验证成功，生成令牌
            user_id = user[0]
            role = user[3]
            
            access_token = generate_token(user_id=user_id, role=role)
            refresh_token = str(uuid.uuid4())  # 简单模拟刷新令牌

            return jsonify({
                'status': 'success',
                'message': '登录成功',
                'data': {
                    'access_token': access_token,
                    'refresh_token': refresh_token,
                    'user': {
                        'id': user_id,
                        'username': user[1],
                        'role': role
                    }
                }
            }), 200
        
        # 回退到测试账号 (仅开发环境使用)
        if username == 'admin' and password == 'admin':
            # 生成令牌
            access_token = generate_token(user_id=1, role='admin')
            refresh_token = str(uuid.uuid4())  # 简单模拟刷新令牌

            return jsonify({
                'status': 'success',
                'message': '登录成功(测试账号)',
                'data': {
                    'access_token': access_token,
                    'refresh_token': refresh_token,
                    'user': {
                        'id': 1,
                        'username': username,
                        'role': 'admin'
                    }
                }
            }), 200
        
        return jsonify({
            'status': 'error',
            'message': '用户名或密码错误'
        }), 401
    except Exception as e:
        print(f"登录验证错误: {e}")
        return jsonify({
            'status': 'error',
            'message': '登录验证过程中发生错误'
        }), 500
    finally:
        db_pool.putconn(conn)

@bp.route('/register', methods=['POST'])
def register():
    """用户注册接口"""
    if not request.is_json:
        return jsonify({
            'status': 'error',
            'message': '请求必须是JSON格式'
        }), 400

    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    email = data.get('email')

    if not username or not password or not email:
        return jsonify({
            'status': 'error',
            'message': '用户名、密码和邮箱为必填项'
        }), 400

    # 连接数据库创建用户
    conn = db_pool.getconn()
    try:
        cursor = conn.cursor()
        
        # 检查用户名是否已存在
        cursor.execute("SELECT COUNT(*) FROM users WHERE username = %s", (username,))
        if cursor.fetchone()[0] > 0:
            cursor.close()
            return jsonify({
                'status': 'error',
                'message': '用户名已被使用'
            }), 400
            
        # 检查邮箱是否已存在
        cursor.execute("SELECT COUNT(*) FROM users WHERE email = %s", (email,))
        if cursor.fetchone()[0] > 0:
            cursor.close()
            return jsonify({
                'status': 'error',
                'message': '邮箱已被注册'
            }), 400
        
        # 生成密码哈希
        password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        # 创建用户
        cursor.execute(
            """
            INSERT INTO users (username, email, password_hash, role, is_active)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING user_id
            """,
            (username, email, password_hash, 'user', True)
        )
        user_id = cursor.fetchone()[0]
        conn.commit()
        cursor.close()
        
        # 生成令牌，实现注册后自动登录
        access_token = generate_token(user_id=user_id, role='user')
        refresh_token = str(uuid.uuid4())
        
        return jsonify({
            'status': 'success',
            'message': '注册成功',
            'data': {
                'access_token': access_token,
                'refresh_token': refresh_token,
                'user': {
                    'id': user_id,
                    'username': username,
                    'email': email,
                    'role': 'user'
                }
            }
        }), 201
    except Exception as e:
        conn.rollback()
        print(f"用户注册错误: {e}")
        return jsonify({
            'status': 'error',
            'message': '注册过程中发生错误'
        }), 500
    finally:
        db_pool.putconn(conn)

@bp.route('/refresh', methods=['POST'])
@refresh_token_required
def refresh():
    """刷新访问令牌"""
    # 在refresh_token_required装饰器中已经验证了刷新令牌
    # 这里的代码假设用户的身份信息在装饰器中已经被设置
    user_id = 1  # 应该从当前用户上下文中获取
    role = 'admin'  # 应该从当前用户上下文中获取

    access_token = generate_token(user_id=user_id, role=role)

    return jsonify({
        'status': 'success',
        'message': '令牌刷新成功',
        'data': {
            'access_token': access_token
        }
    }), 200

@bp.route('/logout', methods=['POST'])
@token_required
def logout():
    """用户注销接口"""
    # 在token_required装饰器中已经验证了访问令牌
    # 实际实现应该将令牌加入黑名单
    # TODO: 实现令牌黑名单

    return jsonify({
        'status': 'success',
        'message': '注销成功'
    }), 200 