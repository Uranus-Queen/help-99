
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

function validateFormData(formData) {
  const errors = [];
  
  if (!formData.email || !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email)) {
    errors.push('邮箱格式无效');
  }
  
  if (!formData.power || !/^(\d+(\.\d+)?)(-\d+(\.\d+)?)?$/.test(formData.power)) {
    errors.push('功率格式无效');
  }
  
  ['inletTemp', 'outletTemp'].forEach(field => {
    if (!formData[field] || isNaN(parseFloat(formData[field])) || 
        parseFloat(formData[field]) < -50 || parseFloat(formData[field]) > 500) {
      errors.push(`${field}温度值无效`);
    }
  });
  
  if (!formData.flowRate || !/^(\d+(\.\d+)?)(-\d+(\.\d+)?)?$/.test(formData.flowRate)) {
    errors.push('流量格式无效');
  }
  
  if (!formData.pressure || !/^(\d+(\.\d+)?)(-\d+(\.\d+)?)?$/.test(formData.pressure)) {
    errors.push('压力格式无效');
  }
  
  const requiredFields = ['heatExchangerType', 'material'];
  requiredFields.forEach(field => {
    if (!formData[field]) {
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

function analyzeUserBehavior(userBehavior) {
  if (!userBehavior) return null;
  
  const analysis = {
    // 鼠标活动分析
    mouseActivity: {
      totalMovements: userBehavior.mouseMovements?.length || 0,
      totalClicks: userBehavior.mouseClicks?.length || 0,
      averageClickPosition: userBehavior.mouseClicks?.length > 0 ? {
        x: userBehavior.mouseClicks.reduce((sum, click) => sum + click.x, 0) / userBehavior.mouseClicks.length,
        y: userBehavior.mouseClicks.reduce((sum, click) => sum + click.y, 0) / userBehavior.mouseClicks.length
      } : null
    },
    
    // 键盘活动分析
    keyboardActivity: {
      totalKeyPresses: userBehavior.keyPresses?.length || 0,
      uniqueKeys: [...new Set(userBehavior.keyPresses?.map(press => press.key) || [])].length
    },
    
    // 滚动行为分析
    scrollBehavior: {
      totalScrolls: userBehavior.scrollEvents?.length || 0,
      maxScrollY: userBehavior.scrollEvents?.length > 0 ? Math.max(...userBehavior.scrollEvents.map(s => s.scrollY)) : 0
    },
    
    // 表单交互分析
    formInteraction: {
      totalInteractions: userBehavior.formInteractions?.length || 0,
      fieldTypes: [...new Set(userBehavior.formInteractions?.map(i => i.fieldType) || [])],
      interactionTypes: [...new Set(userBehavior.formInteractions?.map(i => i.action) || [])]
    },
    
    // 错误监控
    errors: {
      totalErrors: userBehavior.errors?.length || 0,
      errorTypes: [...new Set(userBehavior.errors?.map(e => e.message) || [])]
    },
    
    // 时间分析
    timing: {
      timeOnPage: userBehavior.timeOnPage || 0,
      averageTimeBetweenActions: 0
    }
  };
  
  // 计算平均操作间隔时间
  const allActions = [
    ...(userBehavior.mouseClicks || []),
    ...(userBehavior.keyPresses || []),
    ...(userBehavior.formInteractions || [])
  ].sort((a, b) => a.timestamp - b.timestamp);
  
  if (allActions.length > 1) {
    const intervals = [];
    for (let i = 1; i < allActions.length; i++) {
      intervals.push(allActions[i].timestamp - allActions[i-1].timestamp);
    }
    analysis.timing.averageTimeBetweenActions = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
  }
  
  return analysis;
}

function analyzeClientInfo(clientInfo) {
  if (!clientInfo) return null;
  
  const analysis = {
    // 设备分析
    device: {
      isMobile: /Mobile|Android|iPhone|iPad/.test(clientInfo.userAgent),
      isTablet: /iPad|Tablet/.test(clientInfo.userAgent),
      isDesktop: !/Mobile|Android|iPhone|iPad|Tablet/.test(clientInfo.userAgent),
      platform: clientInfo.platform,
      vendor: clientInfo.vendor
    },
    
    // 浏览器分析
    browser: {
      name: detectBrowserName(clientInfo.userAgent),
      version: detectBrowserVersion(clientInfo.userAgent),
      language: clientInfo.language,
      languages: clientInfo.languages
    },
    
    // 屏幕分析
    screen: {
      resolution: clientInfo.screenResolution,
      availableResolution: clientInfo.screenAvailableResolution,
      colorDepth: clientInfo.colorDepth,
      pixelRatio: clientInfo.devicePixelRatio,
      viewportSize: `${clientInfo.viewportWidth}x${clientInfo.viewportHeight}`
    },
    
    // 网络分析
    network: clientInfo.connection ? {
      type: clientInfo.connection.effectiveType,
      downlink: clientInfo.connection.downlink,
      rtt: clientInfo.connection.rtt,
      saveData: clientInfo.connection.saveData
    } : null,
    
    // 性能分析
    performance: clientInfo.performance ? {
      loadTime: clientInfo.performance.timing ? 
        clientInfo.performance.timing.loadEventEnd - clientInfo.performance.timing.navigationStart : null,
      domContentLoadedTime: clientInfo.performance.timing ?
        clientInfo.performance.timing.domContentLoaded - clientInfo.performance.timing.navigationStart : null,
      memoryUsage: clientInfo.performance.memory ? {
        used: clientInfo.performance.memory.usedJSHeapSize,
        total: clientInfo.performance.memory.totalJSHeapSize,
        limit: clientInfo.performance.memory.jsHeapSizeLimit
      } : null
    } : null,
    
    // 安全分析
    security: {
      cookieEnabled: clientInfo.cookieEnabled,
      localStorage: clientInfo.localStorage,
      sessionStorage: clientInfo.sessionStorage,
      pluginsCount: clientInfo.plugins?.length || 0,
      mimeTypesCount: clientInfo.mimeTypes?.length || 0
    },
    
    // 地理位置
    location: clientInfo.geolocation ? {
      latitude: clientInfo.geolocation.latitude,
      longitude: clientInfo.geolocation.longitude,
      accuracy: clientInfo.geolocation.accuracy
    } : null,
    
    // 硬件指纹
    fingerprint: {
      webgl: clientInfo.webgl ? {
        vendor: clientInfo.webgl.vendor,
        renderer: clientInfo.webgl.renderer
      } : null,
      canvas: clientInfo.canvas,
      fonts: clientInfo.fonts?.length || 0
    }
  };
  
  return analysis;
}

function detectBrowserName(userAgent) {
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Safari')) return 'Safari';
  if (userAgent.includes('Edge')) return 'Edge';
  if (userAgent.includes('Opera')) return 'Opera';
  return 'Unknown';
}

function detectBrowserVersion(userAgent) {
  const match = userAgent.match(/(Chrome|Firefox|Safari|Edge|Opera)\/(\d+)/);
  return match ? match[2] : 'Unknown';
}

function logSecurityEvent(event, data, clientInfo) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event,
    clientInfo: {
      userAgent: clientInfo.userAgent,
      ip: clientInfo.ip,
      sessionId: clientInfo.sessionId,
      timestamp: clientInfo.timestamp
    },
    data: data ? JSON.stringify(data) : null
  };
  
  console.log('安全日志:', JSON.stringify(logEntry));
}

function logDataCollection(submitData) {
  const collectionLog = {
    timestamp: new Date().toISOString(),
    collectionSummary: {
      formDataFields: Object.keys(submitData.formData || {}).length,
      clientInfoFields: Object.keys(submitData.clientInfo || {}).length,
      userBehaviorFields: Object.keys(submitData.userBehavior || {}).length,
      formStatsFields: Object.keys(submitData.formStats || {}).length
    },
    sensitiveDataPresent: {
      email: !!(submitData.formData && submitData.formData.email),
      geolocation: !!(submitData.clientInfo && submitData.clientInfo.geolocation),
      battery: !!(submitData.clientInfo && submitData.clientInfo.battery),
      webgl: !!(submitData.clientInfo && submitData.clientInfo.webgl)
    },
    dataIntegrity: {
      hasFormData: !!(submitData.formData),
      hasClientInfo: !!(submitData.clientInfo),
      hasUserBehavior: !!(submitData.userBehavior),
      hasFormStats: !!(submitData.formStats)
    }
  };
  
  console.log('数据收集日志:', JSON.stringify(collectionLog));
}

exports.main = async (event, context) => {
  try {
    const { encryptedData, signature, timestamp, nonce, csrfToken, metadata } = event.data;
    
    const clientInfo = {
      userAgent: event.headers['user-agent'] || '',
      ip: event.clientIP || '',
      timestamp: Date.now(),
      sessionId: metadata?.sessionId || 'unknown'
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
    
    if (!verifySignature(decryptedData.formData || {}, signature, timestamp, nonce)) {
      logSecurityEvent('SIGNATURE_INVALID', { signature }, clientInfo);
      return {
        code: 403,
        message: 'API签名验证失败'
      };
    }
    
    // 验证表单数据
    const validationErrors = validateFormData(decryptedData.formData || {});
    if (validationErrors.length > 0) {
      logSecurityEvent('VALIDATION_FAILED', { errors: validationErrors }, clientInfo);
      return {
        code: 400,
        message: '数据验证失败',
        errors: validationErrors
      };
    }
    
    // 清理数据
    const sanitizedFormData = sanitizeData(decryptedData.formData || {});
    const sanitizedClientInfo = sanitizeData(decryptedData.clientInfo || {});
    
    // 分析用户行为
    const behaviorAnalysis = analyzeUserBehavior(decryptedData.userBehavior);
    
    // 分析客户端信息
    const clientAnalysis = analyzeClientInfo(decryptedData.clientInfo);
    
    // 准备最终存储数据
    const finalData = {
      // 基础信息
      id: crypto.randomUUID(),
      submittedAt: new Date().toISOString(),
      
      // 表单数据
      formData: sanitizedFormData,
      
      // 客户端信息
      clientInfo: {
        raw: sanitizedClientInfo,
        analysis: clientAnalysis
      },
      
      // 用户行为数据
      userBehavior: {
        raw: decryptedData.userBehavior,
        analysis: behaviorAnalysis
      },
      
      // 表单统计
      formStats: decryptedData.formStats || {},
      
      // 元数据
      metadata: {
        ...metadata,
        serverTimestamp: new Date().toISOString(),
        processingTime: Date.now() - now
      },
      
      // 安全信息
      security: {
        csrfToken,
        signature,
        timestamp,
        nonce,
        verified: true
      }
    };
    
    // 记录数据收集日志
    logDataCollection(decryptedData);
    
    console.log('准备存储完整数据:', JSON.stringify({
      id: finalData.id,
      email: finalData.formData.email,
      clientAnalysis: finalData.clientInfo.analysis,
      behaviorAnalysis: finalData.userBehavior.analysis,
      formStats: finalData.formStats
    }, null, 2));
    
    // 实际应用中的数据库操作
    // await database.collection('heat_exchanger_requests').insertOne(finalData);
    
    logSecurityEvent('SUBMISSION_SUCCESS', { 
      id: finalData.id,
      email: finalData.formData.email,
      dataCollected: true
    }, clientInfo);
    
    return {
      code: 200,
      message: '提交成功',
      data: {
        id: finalData.id,
        submittedAt: finalData.submittedAt,
        dataCollected: true
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
