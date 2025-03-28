import os
import logging
from datetime import datetime
from flask import Flask, jsonify, request
from flask_cors import CORS

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('gateway.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# 创建Flask应用
app = Flask(__name__)
CORS(app, resources={
    r"/*": {
        "origins": "*",
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"],
        "supports_credentials": True
    }
})

# 配置
app.config.from_mapping(
    SECRET_KEY=os.environ.get('SECRET_KEY', 'dev'),
    JWT_SECRET_KEY=os.environ.get('JWT_SECRET_KEY', 'jwt-secret-key'),
    JWT_ACCESS_TOKEN_EXPIRES=3600,  # 1小时
    JWT_REFRESH_TOKEN_EXPIRES=604800,  # 7天
    DATABASE_URL=os.environ.get('DATABASE_URL', 'postgresql://postgres:postgres@db:5432/ecohub'),
    MONGO_URI=os.environ.get('MONGO_URI', 'mongodb://mongo:27017/ecohub'),
    REDIS_URL=os.environ.get('REDIS_URL', 'redis://redis:6379/0'),
)

# 导入路由蓝图
from gateway.routes.auth import bp as auth_bp
from gateway.routes.user import bp as user_bp
from gateway.routes.data import bp as data_bp
from gateway.routes.matching import bp as matching_bp
from gateway.routes.analysis import bp as analysis_bp
from gateway.routes.marketplace import bp as marketplace_bp
from gateway.routes.ai import bp as ai_bp
from gateway.routes.password_reset import bp as password_bp
from gateway.routes.role import bp as role_bp

# 注册蓝图
app.register_blueprint(auth_bp)
app.register_blueprint(user_bp)
app.register_blueprint(data_bp)
app.register_blueprint(matching_bp)
app.register_blueprint(analysis_bp)
app.register_blueprint(marketplace_bp)
app.register_blueprint(ai_bp)
app.register_blueprint(password_bp)
app.register_blueprint(role_bp)

# 请求日志中间件
@app.before_request
def log_request_info():
    logger.info('Headers: %s', request.headers)
    logger.info('Body: %s', request.get_data())

# 响应日志中间件
@app.after_request
def log_response_info(response):
    logger.info('Response: %s', response.get_data())
    return response

@app.route('/')
def home():
    """API首页"""
    return jsonify({
        'message': 'Welcome to EcoHub API',
        'status': 'success',
        'version': '0.1.0',
        'endpoints': {
            'health': '/health',
            'api': '/api/v1'
        }
    })

@app.route('/api/v1')
def api_routes():
    """API路由列表"""
    return jsonify({
        'status': 'success',
        'message': 'Available API Routes',
        'routes': {
            'user': '/api/v1/user',
            'data': '/api/v1/data',
            'matching': '/api/v1/matching',
            'analysis': '/api/v1/analysis',
            'marketplace': '/api/v1/marketplace',
            'ai': '/api/v1/ai',
            'cache': '/api/v1/cache'
        }
    })

# 错误处理
@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'status': 'error',
        'message': 'Not found',
        'error': str(error)
    }), 404

@app.errorhandler(500)
def server_error(error):
    return jsonify({
        'status': 'error',
        'message': 'Internal server error',
        'error': str(error)
    }), 500

# 健康检查端点
@app.route('/health')
def health_check():
    return jsonify({
        'status': 'success',
        'timestamp': datetime.utcnow().isoformat(),
        'message': 'API Gateway is running',
        'version': '0.1.0'
    })

# API健康检查端点
@app.route('/api/health')
def api_health_check():
    return jsonify({
        'status': 'success',
        'timestamp': datetime.utcnow().isoformat(),
        'message': 'API Gateway is running',
        'version': '0.1.0'
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True) 
# 添加对v1 API路径的支持
try:
    from gateway.routes import v1_compat
    app.register_blueprint(v1_compat.bp)
    print('已添加对v1 API路径的支持')
except Exception as e:
    print(f'添加v1 API路径支持时出错: {e}')
