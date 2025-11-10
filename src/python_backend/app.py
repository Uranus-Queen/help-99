
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
换热器参数表单 - Python后端服务器
安全接收和处理来自Cloudflare Pages的表单数据
"""

import os
import json
import hashlib
import base64
import logging
from datetime import datetime, timedelta
from functools import wraps
from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import re
import secrets
from typing import Dict, Any, Optional, List

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('/var/log/heat_exchanger.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Flask应用初始化
app = Flask(__name__)
CORS(app, origins=['*'], methods=['GET', 'POST', 'OPTIONS'])

# 安全配置
class SecurityConfig:
    # 请求时间窗口 (5分钟)
    TIME_WINDOW = 5 * 60
    # 最大请求次数
    MAX_REQUESTS = 10
    # API密钥 (实际应用中应从环境变量获取)
    API_KEY = os.getenv('API_KEY', 'your-secret-api-key-change-this-in-production')
    # 数据库路径
    DB_PATH = '/var/lib/heat_exchanger/requests.db'
    # 允许的域名 (CORS)
    ALLOWED_ORIGINS = [
        'https://your-domain.pages.dev',  # 替换为您的Cloudflare Pages域名
        'http://localhost:3000',  # 开发环境
        'https://localhost:3000'
    ]

# 内存存储 (生产环境应使用Redis)
request_store = {}
security_logs = []

class DatabaseManager:
    """数据库管理类"""
    
    def __init__(self, db_path: str):
        self.db_path = db_path
        self.init_database()
    
    def init_database(self):
        """初始化数据库"""
        try:
            # 确保数据库目录存在
            os.makedirs(os.path.dirname(self.db_path), exist_ok=True)
            
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                # 创建表单数据表
                cursor.execute('''
                    CREATE TABLE IF NOT EXISTS heat_exchanger_requests (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        request_id TEXT UNIQUE NOT NULL,
                        email TEXT NOT NULL,
                        heat_exchanger_type TEXT NOT NULL,
                        power TEXT NOT NULL,
                        inlet_temp REAL NOT NULL,
                        outlet_temp REAL NOT NULL,
                        flow_rate TEXT NOT NULL,
                        pressure TEXT NOT NULL,
                        material TEXT NOT NULL,
                        application TEXT,
                        additional_requirements TEXT,
                        client_info TEXT,
                        ip_address TEXT,
                        user_agent TEXT,
                        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        processed BOOLEAN DEFAULT FALSE,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                ''')
                
                # 创建安全日志表
                cursor.execute('''
                    CREATE TABLE IF NOT EXISTS security_logs (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        event_type TEXT NOT NULL,
                        client_ip TEXT,
                        user_agent TEXT,
                        details TEXT,
                        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                ''')
                
                conn.commit()
                logger.info("数据库初始化成功")
                
        except Exception as e:
            logger.error(f"数据库初始化失败: {e}")
            raise
    
    def insert_request(self, data: Dict[str, Any]) -> bool:
        """插入表单请求数据"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute('''
                    INSERT INTO heat_exchanger_requests (
                        request_id, email, heat_exchanger_type, power, inlet_temp, outlet_temp,
                        flow_rate, pressure, material, application, additional_requirements,
                        client_info, ip_address, user_agent
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    data.get('request_id'),
                    data.get('email'),
                    data.get('heatExchangerType'),
                    data.get('power'),
                    float(data.get('inletTemp', 0)),
                    float(data.get('outletTemp', 0)),
                    data.get('flowRate'),
                    data.get('pressure'),
                    data.get('material'),
                    data.get('application'),
                    data.get('additionalRequirements'),
                    json.dumps(data.get('clientInfo', {})),
                    data.get('ip_address'),
                    data.get('user_agent')
                ))
                conn.commit()
                return True
        except Exception as e:
            logger.error(f"插入数据失败: {e}")
            return False
    
    def insert_security_log(self, event_type: str, client_ip: str, user_agent: str, details: str):
        """插入安全日志"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute('''
                    INSERT INTO security_logs (event_type, client_ip, user_agent, details)
                    VALUES (?, ?, ?, ?)
                ''', (event_type, client_ip, user_agent, details))
                conn.commit()
        except Exception as e:
            logger.error(f"插入安全日志失败: {e}")

# 初始化数据库管理器
db_manager = DatabaseManager(SecurityConfig.DB_PATH)

class SecurityValidator:
    """安全验证类"""
    
    @staticmethod
    def escape_html(text: str) -> str:
        """HTML转义 - 防止XSS攻击"""
        if not text:
            return ''
        html_escape_table = {
            "&": "&amp;",
            '"': "&quot;",
            "'": "&#x27;",
            ">": "&gt;",
            "<": "&lt;",
        }
        return "".join(html_escape_table.get(c, c) for c in text)
    
    @staticmethod
    def decrypt_data(encrypted_data: str) -> Optional[Dict[str, Any]]:
        """数据解密"""
        try:
            # Base64解码
            json_string = base64.b64decode(encrypted_data).decode('utf-8')
            return json.loads(json_string)
        except Exception as e:
            logger.error(f"数据解密失败: {e}")
            return None
    
    @staticmethod
    def verify_signature(data: Dict[str, Any], signature: str, timestamp: str, nonce: str) -> bool:
        """验证API签名"""
        try:
            string_to_sign = f"{json.dumps(data, sort_keys=True)}{timestamp}{nonce}"
            expected_signature = hashlib.sha256(
                (string_to_sign + SecurityConfig.API_KEY).encode()
            ).hexdigest()
            return expected_signature == signature
        except Exception as e:
            logger.error(f"签名验证失败: {e}")
            return False
    
    @staticmethod
    def verify_csrf_token(token: str) -> bool:
        """验证CSRF Token"""
        return token and len(token) == 64 and re.match(r'^[a-f0-9]+$', token)
    
    @staticmethod
    def check_rate_limit(client_ip: str) -> bool:
        """检查请求频率限制"""
        now = datetime.now()
        requests = request_store.get(client_ip, [])
        
        # 清理过期请求
        valid_requests = [req_time for req_time in requests 
                         if now - req_time < timedelta(seconds=SecurityConfig.TIME_WINDOW)]
        
        if len(valid_requests) >= SecurityConfig.MAX_REQUESTS:
            return False
        
        valid_requests.append(now)
        request_store[client_ip] = valid_requests
        return True
    
    @staticmethod
    def validate_data(data: Dict[str, Any]) -> List[str]:
        """数据验证"""
        errors = []
        
        # 邮箱验证
        email = data.get('email', '').strip()
        if not email or not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', email):
            errors.append('邮箱格式无效')
        
        # 功率验证
        power = data.get('power', '').strip()
        if not power or not re.match(r'^(\d+(\.\d+)?)(-\d+(\.\d+)?)?$', power):
            errors.push('功率格式无效')
        
        # 温度验证
        for field in ['inletTemp', 'outletTemp']:
            try:
                temp = float(data.get(field, 0))
                if temp < -50 or temp > 500:
                    errors.append(f'{field}温度值超出有效范围(-50°C 到 500°C)')
            except (ValueError, TypeError):
                errors.append(f'{field}温度值无效')
        
        # 流量验证
        flow_rate = data.get('flowRate', '').strip()
        if not flow_rate or not re.match(r'^(\d+(\.\d+)?)(-\d+(\.\d+)?)?$', flow_rate):
            errors.append('流量格式无效')
        
        # 压力验证
        pressure = data.get('pressure', '').strip()
        if not pressure or not re.match(r'^(\d+(\.\d+)?)(-\d+(\.\d+)?)?$', pressure):
            errors.append('压力格式无效')
        
        # 必填字段验证
        required_fields = ['heatExchangerType', 'material']
        for field in required_fields:
            if not data.get(field, '').strip():
                errors.append(f'{field}为必填项')
        
        return errors
    
    @staticmethod
    def sanitize_data(data: Dict[str, Any]) -> Dict[str, Any]:
        """数据清理"""
        sanitized = {}
        for key, value in data.items():
            if isinstance(value, str):
                sanitized[key] = SecurityValidator.escape_html(value.strip())
            else:
                sanitized[key] = value
        return sanitized

def log_security_event(event_type: str, details: str, request_info: Dict[str, Any]):
    """记录安全事件"""
    log_entry = {
        'timestamp': datetime.now().isoformat(),
        'event_type': event_type,
        'client_ip': request_info.get('client_ip'),
        'user_agent': request_info.get('user_agent'),
        'details': details
    }
    
    security_logs.append(log_entry)
    logger.warning(f"安全事件: {event_type} - {details}")
    
    # 存储到数据库
    db_manager.insert_security_log(
        event_type,
        request_info.get('client_ip'),
        request_info.get('user_agent'),
        details
    )

def get_client_info() -> Dict[str, Any]:
    """获取客户端信息"""
    return {
        'client_ip': request.environ.get('HTTP_X_FORWARDED_FOR', request.remote_addr),
        'user_agent': request.headers.get('User-Agent', ''),
        'origin': request.headers.get('Origin', ''),
        'referer': request.headers.get('Referer', ''),
        'timestamp': datetime.now().isoformat()
    }

def security_check(f):
    """安全检查装饰器"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        client_info = get_client_info()
        
        # 1. 检查请求频率限制
        if not SecurityValidator.check_rate_limit(client_info['client_ip']):
            log_security_event('RATE_LIMIT_EXCEEDED', '请求过于频繁', client_info)
            return jsonify({'code': 429, 'message': '请求过于频繁，请稍后再试'}), 429
        
        # 2. 验证Origin头 (CORS保护)
        origin = client_info['origin']
        if origin and origin not in SecurityConfig.ALLOWED_ORIGINS:
            log_security_event('INVALID_ORIGIN', f'无效的Origin: {origin}', client_info)
            return jsonify({'code': 403, 'message': '无效的请求来源'}), 403
        
        return f(*args, **kwargs)
    return decorated_function

@app.route('/api/health', methods=['GET'])
def health_check():
    """健康检查端点"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'version': '1.0.0'
    })

@app.route('/api/heat-exchanger/submit', methods=['POST', 'OPTIONS'])
@security_check
def submit_heat_exchanger_request():
    """提交换热器参数请求"""
    client_info = get_client_info()
    
    try:
        if request.method == 'OPTIONS':
            return '', 200
        
        data = request.get_json()
        if not data:
            log_security_event('MISSING_DATA', '请求数据缺失', client_info)
            return jsonify({'code': 400, 'message': '请求数据缺失'}), 400
        
        # 获取请求数据
        encrypted_data = data.get('encryptedData')
        signature = data.get('signature')
        timestamp = data.get('timestamp')
        nonce = data.get('nonce')
        csrf_token = data.get('csrfToken')
        
        # 3. 验证CSRF Token
        if not SecurityValidator.verify_csrf_token(csrf_token):
            log_security_event('CSRF_TOKEN_INVALID', f'无效的CSRF Token: {csrf_token}', client_info)
            return jsonify({'code': 403, 'message': 'CSRF验证失败'}), 403
        
        # 4. 验证时间戳 (防止重放攻击)
        try:
            request_time = int(timestamp)
            current_time = int(datetime.now().timestamp())
            if abs(current_time - request_time) > SecurityConfig.TIME_WINDOW:
                log_security_event('TIMESTAMP_INVALID', f'无效的时间戳: {timestamp}', client_info)
                return jsonify({'code': 403, 'message': '请求时间戳无效'}), 403
        except (ValueError, TypeError):
            log_security_event('TIMESTAMP_INVALID', f'时间戳格式错误: {timestamp}', client_info)
            return jsonify({'code': 403, 'message': '时间戳格式错误'}), 403
        
        # 5. 验证API签名
        if not signature:
            log_security_event('SIGNATURE_MISSING', 'API签名缺失', client_info)
            return jsonify({'code': 403, 'message': 'API签名缺失'}), 403
        
        # 6. 解密数据
        decrypted_data = SecurityValidator.decrypt_data(encrypted_data)
        if not decrypted_data:
            log_security_event('DECRYPTION_FAILED', '数据解密失败', client_info)
            return jsonify({'code': 400, 'message': '数据解密失败'}), 400
        
        # 7. 验证API签名
        if not SecurityValidator.verify_signature(decrypted_data, signature, timestamp, nonce):
            log_security_event('SIGNATURE_INVALID', f'无效的API签名: {signature}', client_info)
            return jsonify({'code': 403, 'message': 'API签名验证失败'}), 403
        
        # 8. 数据验证
        validation_errors = SecurityValidator.validate_data(decrypted_data)
        if validation_errors:
            log_security_event('VALIDATION_FAILED', f'数据验证失败: {validation_errors}', client_info)
            return jsonify({
                'code': 400, 
                'message': '数据验证失败', 
                'errors': validation_errors
            }), 400
        
        # 9. 数据清理
        sanitized_data = SecurityValidator.sanitize_data(decrypted_data)
        
        # 10. 添加元数据
        import uuid
        final_data = {
            **sanitized_data,
            'request_id': str(uuid.uuid4()),
            'ip_address': client_info['client_ip'],
            'user_agent': client_info['user_agent'],
            'submitted_at': datetime.now().isoformat()
        }
        
        # 11. 存储数据
        if db_manager.insert_request(final_data):
            logger.info(f"表单数据存储成功: {final_data['request_id']}")
            log_security_event('SUBMISSION_SUCCESS', f'表单提交成功: {final_data["request_id"]}', client_info)
            
            return jsonify({
                'code': 200,
                'message': '提交成功',
                'data': {
                    'request_id': final_data['request_id'],
                    'submitted_at': final_data['submitted_at']
                }
            })
        else:
            log_security_event('DATABASE_ERROR', '数据存储失败', client_info)
            return jsonify({'code': 500, 'message': '数据存储失败'}), 500
    
    except Exception as e:
        logger.error(f"处理请求时发生错误: {e}")
        log_security_event('SYSTEM_ERROR', f'系统错误: {str(e)}', client_info)
        return jsonify({'code': 500, 'message': '系统错误，请稍后重试'}), 500

@app.route('/api/admin/requests', methods=['GET'])
def get_requests():
    """获取表单请求列表 (管理员接口)"""
    try:
        # 这里应该添加身份验证
        with sqlite3.connect(SecurityConfig.DB_PATH) as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT * FROM heat_exchanger_requests 
                ORDER BY submitted_at DESC 
                LIMIT 100
            ''')
            requests = cursor.fetchall()
            
            # 转换为字典格式
            columns = [description[0] for description in cursor.description]
            result = [dict(zip(columns, row)) for row in requests]
            
            return jsonify({
                'code': 200,
                'message': '获取成功',
                'data': result
            })
    except Exception as e:
        logger.error(f"获取请求列表失败: {e}")
        return jsonify({'code': 500, 'message': '获取失败'}), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({'code': 404, 'message': '接口不存在'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'code': 500, 'message': '服务器内部错误'}), 500

if __name__ == '__main__':
    logger.info("启动换热器参数表单后端服务器...")
    logger.info(f"数据库路径: {SecurityConfig.DB_PATH}")
    
    # 生产环境建议使用 gunicorn
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=False,  # 生产环境设为False
        ssl_context=('cert.pem', 'key.pem')  # 如果有SSL证书
    )
