
const crypto = require('crypto');

const SECURITY_CONFIG = {
  timeWindow: 5 * 60 * 1000,
  maxRequests: 10,
  encryptionKey: process.env.ENCRYPTION_KEY || 'your-secret-key-here',
  apiKey: process.env.API_KEY || 'your-api-key-here'
};

const requestStore = new Map();

function escapeHtml(text) {
  if (!text) return '';
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
    '/': '&#x2F;'
  };
  return text.replace(/[&<>"'/]/g, (m) => map[m]);
}

function decryptData(encryptedData) {
  try {
    const jsonString = Buffer.from(encryptedData, 'base64').toString();
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('数据解密失败:', error);
    return null;
  }
}

function verifySignature(data, signature, timestamp, nonce) {
  try {
    const stringToSign = `${JSON.stringify(data)}${timestamp}${nonce}`;
    const hash = crypto.createHash('sha256').update(stringToSign + SECURITY_CONFIG.apiKey).digest('hex');
    return hash === signature;
  } catch (error) {
    console.error('签名验证失败:', error);
    return false;
  }
}

function verifyCSRFToken(token) {
  return token && token.length === 64 && /^[a-f0-9]+$/.test(token);
}

function checkRateLimit(clientInfo) {
  const clientId = clientInfo.userAgent + clientInfo.ip;
  const now = Date.now();
  const requests = requestStore.get(clientId) || [];
  
  const validRequests = requests.filter(time => now - time < SECURITY_CONFIG.timeWindow);
  
  if (validRequests.length >= SECURITY_CONFIG.maxRequests) {
    return false;
  }
  
  validRequests.push(now);
  requestStore.set(clientId, validRequests);
  return true;
}

function validateData(data) {
  const errors = [];
  
  if (!data.email || !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(data.email)) {
    errors.push('邮箱格式无效');
  }
  
  if (!data.power || !/^(\d+(\.\d+)?)(-\d+(\.\d+)?)?$/.test(data.power)) {
    errors.push('功率格式无效');
  }
  
  ['inletTemp', 'outletTemp'].forEach(field => {
    if (!data[field] || isNaN(parseFloat(data[field])) || 
        parseFloat(data[field]) < -50 || parseFloat(data[field]) > 500) {
      errors.push(`${field}温度值无效`);
    }
  });
  
  if (!data.flowRate || !/^(\d+(\.\d+)?)(-\d+(\.\d+)?)?$/.test(data.flowRate)) {
    errors.push('流量格式无效');
  }
  
  if (!data.pressure || !/^(\d+(\.\d+)?)(-\d+(\.\d+)?)?$/.test(data.pressure)) {
    errors.push('压力格式无效');
  }
  
  const requiredFields = ['heatExchangerType', 'material'];
  requiredFields.forEach(field => {
    if (!data[field]) {
      errors.push(`${field}为必填项`);
    }
  });
  
  return errors;
}

function sanitizeData(data) {
  const sanitized = {};
  Object.keys(data).forEach(key => {
    if (data[key] && typeof data[key] === 'string') {
      sanitized[key] = escapeHtml(data[key].trim());
    } else {
      sanitized[key] = data[key];
    }
  });
  return sanitized;
}

function logSecurityEvent(event, data, clientInfo) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event,
    clientInfo: {
      userAgent: clientInfo.userAgent,
      ip: clientInfo.ip,
      timestamp: clientInfo.timestamp
    },
    data: data ? JSON.stringify(data) : null
  };
  
  console.log('安全日志:', JSON.stringify(logEntry));
}

exports.main = async (event, context) => {
  try {
    const { encryptedData, signature, timestamp, nonce, csrfToken } = event.data;
    
    const clientInfo = {
      userAgent: event.headers['user-agent'] || '',
      ip: event.clientIP || '',
      timestamp: Date.now()
    };
    
    if (!checkRateLimit(clientInfo)) {
      logSecurityEvent('RATE_LIMIT_EXCEEDED', null, clientInfo);
      return {
        code: 429,
        message: '请求过于频繁，请稍后再试'
      };
    }
    
    if (!verifyCSRFToken(csrfToken)) {
      logSecurityEvent('CSRF_TOKEN_INVALID', { csrfToken }, clientInfo);
      return {
        code: 403,
        message: 'CSRF验证失败'
      };
    }
    
    const now = Date.now();
    if (Math.abs(now - parseInt(timestamp)) > SECURITY_CONFIG.timeWindow) {
      logSecurityEvent('TIMESTAMP_INVALID', { timestamp }, clientInfo);
      return {
        code: 403,
        message: '请求时间戳无效'
      };
    }
    
    if (!signature) {
      logSecurityEvent('SIGNATURE_MISSING', null, clientInfo);
      return {
        code: 403,
        message: 'API签名缺失'
      };
    }
    
    const decryptedData = decryptData(encryptedData);
    if (!decryptedData) {
      logSecurityEvent('DECRYPTION_FAILED', { encryptedData: '***' }, clientInfo);
      return {
        code: 400,
        message: '数据解密失败'
      };
    }
    
    if (!verifySignature(decryptedData, signature, timestamp, nonce)) {
      logSecurityEvent('SIGNATURE_INVALID', { signature }, clientInfo);
      return {
        code: 403,
        message: 'API签名验证失败'
      };
    }
    
    const validationErrors = validateData(decryptedData);
    if (validationErrors.length > 0) {
      logSecurityEvent('VALIDATION_FAILED', { errors: validationErrors }, clientInfo);
      return {
        code: 400,
        message: '数据验证失败',
        errors: validationErrors
      };
    }
    
    const sanitizedData = sanitizeData(decryptedData);
    
    const finalData = {
      ...sanitizedData,
      clientInfo,
      submittedAt: new Date().toISOString(),
      id: crypto.randomUUID()
    };
    
    console.log('准备存储数据:', JSON.stringify(finalData, null, 2));
    
    logSecurityEvent('SUBMISSION_SUCCESS', { 
      id: finalData.id,
      email: finalData.email 
    }, clientInfo);
    
    return {
      code: 200,
      message: '提交成功',
      data: {
        id: finalData.id,
        submittedAt: finalData.submittedAt
      }
    };
    
  } catch (error) {
    console.error('云函数执行错误:', error);
    
    const clientInfo = {
      userAgent: event.headers['user-agent'] || '',
      ip: event.clientIP || '',
      timestamp: Date.now()
    };
    
    logSecurityEvent('SYSTEM_ERROR', { 
      error: error.message,
      stack: error.stack 
    }, clientInfo);
    
    return {
      code: 500,
      message: '系统错误，请稍后重试'
    };
  }
};
