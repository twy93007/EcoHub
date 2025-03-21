import os
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# 配置
app.config.from_mapping(
    SECRET_KEY=os.environ.get('SECRET_KEY', 'dev'),
    DATABASE_URL=os.environ.get('DATABASE_URL', 'postgresql://postgres:postgres@db:5432/ecohub'),
    MONGO_URI=os.environ.get('MONGO_URI', 'mongodb://mongo:27017/ecohub'),
    REDIS_URL=os.environ.get('REDIS_URL', 'redis://redis:6379/0'),
)

@app.route('/health')
def health_check():
    """健康检查端点"""
    return jsonify({
        'status': 'success',
        'message': 'EcoHub API is running',
        'version': '0.1.0'
    })

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
            'ai': '/api/v1/ai'
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

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True) 