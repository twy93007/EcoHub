from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/')
def index():
    return jsonify({
        'status': 'success',
        'message': 'Welcome to EcoHub API',
        'version': '0.1.0'
    })

@app.route('/api/health')
def health():
    return jsonify({
        'status': 'success',
        'message': 'EcoHub API is running'
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True) 