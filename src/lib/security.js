
// 安全工具函数库

// XSS防护 - HTML转义
export const escapeHtml = (text) => {
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
};

// 输入验证函数
export const validators = {
  // 邮箱验证
  email: (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  },
  
  // 功率验证 (支持范围值)
  power: (power) => {
    if (!power) return false;
    const rangeRegex = /^(\d+(\.\d+)?)(-\d+(\.\d+)?)?$/;
    if (!rangeRegex.test(power)) return false;
    
    const parts = power.split('-');
    if (parts.length === 1) {
      const value = parseFloat(parts[0]);
      return value > 0 && value <= 10000;
    } else if (parts.length === 2) {
      const min = parseFloat(parts[0]);
      const max = parseFloat(parts[1]);
      return min > 0 && max <= 10000 && min < max;
    }
    return false;
  },
  
  // 温度验证
  temperature: (temp) => {
    const value = parseFloat(temp);
    return !isNaN(value) && value >= -50 && value <= 500;
  },
  
  // 流量验证 (支持范围值)
  flowRate: (flowRate) => {
    if (!flowRate) return false;
    const rangeRegex = /^(\d+(\.\d+)?)(-\d+(\.\d+)?)?$/;
    if (!rangeRegex.test(flowRate)) return false;
    
    const parts = flowRate.split('-');
    if (parts.length === 1) {
      const value = parseFloat(parts[0]);
      return value > 0 && value <= 10000;
    } else if (parts.length === 2) {
      const min = parseFloat(parts[0]);
      const max = parseFloat(parts[1]);
      return min > 0 && max <= 10000 && min < max;
    }
    return false;
  },
  
  // 压力验证 (支持范围值)
  pressure: (pressure) => {
    if (!pressure) return false;
    const rangeRegex = /^(\d+(\.\d+)?)(-\d+(\.\d+)?)?$/;
    if (!rangeRegex.test(pressure)) return false;
    
    const parts = pressure.split('-');
    if (parts.length === 1) {
      const value = parseFloat(parts[0]);
      return value > 0 && value <= 50;
    } else if (parts.length === 2) {
      const min = parseFloat(parts[0]);
      const max = parseFloat(parts[1]);
      return min > 0 && max <= 50 && min < max;
    }
    return false;
  },
  
  // 文本长度验证
  textLength: (text, minLength = 0, maxLength = 1000) => {
    return text && text.length >= minLength && text.length <= maxLength;
  },
  
  // 选择项验证
  selectOption: (value, allowedValues) => {
    return allowedValues.includes(value);
  }
};

// 数据加密函数
export const encryptData = (data) => {
  try {
    const jsonString = JSON.stringify(data);
    return btoa(unescape(encodeURIComponent(jsonString)));
  } catch (error) {
    console.error('数据加密失败:', error);
    return null;
  }
};

// 生成CSRF Token
export const generateCSRFToken = () => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

// API签名生成
export const generateAPISignature = (data, timestamp, nonce) => {
  const stringToSign = `${JSON.stringify(data)}${timestamp}${nonce}`;
  let hash = 0;
  for (let i = 0; i < stringToSign.length; i++) {
    const char = stringToSign.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(16);
};

// 增强的客户端信息收集
export const getEnhancedClientInfo = () => {
  const info = {
    // 基础浏览器信息
    userAgent: navigator.userAgent,
    language: navigator.language,
    languages: navigator.languages || [],
    platform: navigator.platform,
    vendor: navigator.vendor,
    
    // 屏幕和设备信息
    screenResolution: `${screen.width}x${screen.height}`,
    screenAvailableResolution: `${screen.availWidth}x${screen.availHeight}`,
    colorDepth: screen.colorDepth,
    pixelDepth: screen.pixelDepth,
    devicePixelRatio: window.devicePixelRatio || 1,
    
    // 视口信息
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    
    // 时区和本地化
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    timezoneOffset: new Date().getTimezoneOffset(),
    
    // 网络信息
    connection: navigator.connection ? {
      effectiveType: navigator.connection.effectiveType,
      downlink: navigator.connection.downlink,
      rtt: navigator.connection.rtt,
      saveData: navigator.connection.saveData
    } : null,
    
    // 性能信息
    performance: {
      timing: performance.timing ? {
        navigationStart: performance.timing.navigationStart,
        loadEventEnd: performance.timing.loadEventEnd,
        domContentLoaded: performance.timing.domContentLoadedEventEnd
      } : null,
      memory: performance.memory ? {
        usedJSHeapSize: performance.memory.usedJSHeapSize,
        totalJSHeapSize: performance.memory.totalJSHeapSize,
        jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
      } : null
    },
    
    // Cookie和存储信息
    cookieEnabled: navigator.cookieEnabled,
    localStorage: typeof(Storage) !== "undefined" && typeof(localStorage) !== "undefined",
    sessionStorage: typeof(Storage) !== "undefined" && typeof(sessionStorage) !== "undefined",
    
    // 插件信息
    plugins: Array.from(navigator.plugins).map(plugin => ({
      name: plugin.name,
      description: plugin.description
    })),
    
    // MIME类型
    mimeTypes: Array.from(navigator.mimeTypes).map(mimeType => mimeType.type),
    
    // 在线状态
    onLine: navigator.onLine,
    
    // 电池信息（如果支持）
    battery: null,
    
    // 地理位置信息（需要用户授权）
    geolocation: null,
    
    // WebGL信息
    webgl: null,
    
    // Canvas指纹
    canvas: null,
    
    // 音频上下文指纹
    audio: null,
    
    // 字体检测
    fonts: null,
    
    // 时间戳
    timestamp: Date.now(),
    
    // 会话信息
    sessionId: sessionStorage.getItem('sessionId') || generateSessionId(),
    
    // 页面信息
    pageUrl: window.location.href,
    referrer: document.referrer,
    title: document.title
  };
  
  // 获取电池信息
  if (navigator.getBattery) {
    navigator.getBattery().then(battery => {
      info.battery = {
        charging: battery.charging,
        level: battery.level,
        chargingTime: battery.chargingTime,
        dischargingTime: battery.dischargingTime
      };
    }).catch(() => {
      // 忽略电池信息获取失败
    });
  }
  
  // 获取地理位置信息（需要用户授权）
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        info.geolocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude,
          altitudeAccuracy: position.coords.altitudeAccuracy,
          heading: position.coords.heading,
          speed: position.coords.speed
        };
      },
      (error) => {
        console.log('地理位置获取失败:', error);
      },
      {
        timeout: 10000,
        enableHighAccuracy: true
      }
    );
  }
  
  // 获取WebGL信息
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (gl) {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      info.webgl = {
        vendor: gl.getParameter(gl.VENDOR),
        renderer: gl.getParameter(gl.RENDERER),
        unmaskedVendor: debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : null,
        unmaskedRenderer: debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : null,
        version: gl.getParameter(gl.VERSION),
        shadingLanguageVersion: gl.getParameter(gl.SHADING_LANGUAGE_VERSION)
      };
    }
  } catch (error) {
    console.log('WebGL信息获取失败:', error);
  }
  
  // 获取Canvas指纹
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 200;
    canvas.height = 50;
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('Canvas fingerprint', 2, 15);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText('Canvas fingerprint', 4, 17);
    info.canvas = canvas.toDataURL().slice(-50);
  } catch (error) {
    console.log('Canvas指纹获取失败:', error);
  }
  
  // 获取音频上下文指纹
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      const audioContext = new AudioContext();
      const oscillator = audioContext.createOscillator();
      const analyser = audioContext.createAnalyser();
      const gainNode = audioContext.createGain();
      const scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1);
      
      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(10000, audioContext.currentTime);
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      
      oscillator.connect(analyser);
      analyser.connect(scriptProcessor);
      scriptProcessor.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.start(0);
      
      setTimeout(() => {
        oscillator.stop();
        audioContext.close();
      }, 100);
    }
  } catch (error) {
    console.log('音频指纹获取失败:', error);
  }
  
  // 检测常用字体
  try {
    const testFonts = [
      'Arial', 'Arial Black', 'Comic Sans MS', 'Courier New', 'Georgia',
      'Helvetica', 'Impact', 'Times New Roman', 'Trebuchet MS', 'Verdana'
    ];
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const text = 'mmmmmmmmmmlli';
    const fontSize = '72px';
    
    const detectedFonts = [];
    testFonts.forEach(font => {
      ctx.font = `${fontSize} '${font}'`;
      const width = ctx.measureText(text).width;
      ctx.font = `${fontSize} monospace`;
      const monospaceWidth = ctx.measureText(text).width;
      
      if (width !== monospaceWidth) {
        detectedFonts.push(font);
      }
    });
    
    info.fonts = detectedFonts;
  } catch (error) {
    console.log('字体检测失败:', error);
  }
  
  return info;
};

// 生成会话ID
function generateSessionId() {
  const sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  sessionStorage.setItem('sessionId', sessionId);
  return sessionId;
}

// 收集用户行为数据
export const collectUserBehavior = () => {
  const behavior = {
    // 页面停留时间
    pageLoadTime: Date.now(),
    timeOnPage: 0,
    
    // 鼠标移动数据
    mouseMovements: [],
    mouseClicks: [],
    
    // 键盘输入数据
    keyPresses: [],
    
    // 滚动行为
    scrollEvents: [],
    
    // 表单交互
    formInteractions: [],
    
    // 窗口大小变化
    resizeEvents: [],
    
    // 焦点变化
    focusEvents: [],
    
    // 错误事件
    errors: []
  };
  
  // 监听鼠标移动
  let mouseMoveCount = 0;
  const mouseMoveHandler = (event) => {
    if (mouseMoveCount < 100) { // 限制记录数量
      behavior.mouseMovements.push({
        x: event.clientX,
        y: event.clientY,
        timestamp: Date.now()
      });
      mouseMoveCount++;
    }
  };
  
  // 监听鼠标点击
  const clickHandler = (event) => {
    behavior.mouseClicks.push({
      x: event.clientX,
      y: event.clientY,
      target: event.target.tagName,
      timestamp: Date.now()
    });
  };
  
  // 监听键盘输入
  const keyPressHandler = (event) => {
    behavior.keyPresses.push({
      key: event.key,
      code: event.code,
      timestamp: Date.now()
    });
  };
  
  // 监听滚动事件
  let scrollCount = 0;
  const scrollHandler = () => {
    if (scrollCount < 50) { // 限制记录数量
      behavior.scrollEvents.push({
        scrollX: window.scrollX,
        scrollY: window.scrollY,
        timestamp: Date.now()
      });
      scrollCount++;
    }
  };
  
  // 监听窗口大小变化
  const resizeHandler = () => {
    behavior.resizeEvents.push({
      width: window.innerWidth,
      height: window.innerHeight,
      timestamp: Date.now()
    });
  };
  
  // 监听焦点变化
  const focusHandler = (event) => {
    behavior.focusEvents.push({
      type: event.type,
      target: event.target.tagName,
      timestamp: Date.now()
    });
  };
  
  // 监听错误事件
  const errorHandler = (event) => {
    behavior.errors.push({
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      timestamp: Date.now()
    });
  };
  
  // 监听表单交互
  const formInteractionHandler = (event) => {
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA' || event.target.tagName === 'SELECT') {
      behavior.formInteractions.push({
        fieldType: event.target.tagName,
        fieldName: event.target.name || event.target.id,
        action: event.type,
        timestamp: Date.now()
      });
    }
  };
  
  // 添加事件监听器
  document.addEventListener('mousemove', mouseMoveHandler);
  document.addEventListener('click', clickHandler);
  document.addEventListener('keypress', keyPressHandler);
  window.addEventListener('scroll', scrollHandler);
  window.addEventListener('resize', resizeHandler);
  window.addEventListener('focus', focusHandler);
  window.addEventListener('blur', focusHandler);
  window.addEventListener('error', errorHandler);
  document.addEventListener('focusin', formInteractionHandler);
  document.addEventListener('focusout', formInteractionHandler);
  document.addEventListener('input', formInteractionHandler);
  
  // 返回清理函数
  return () => {
    document.removeEventListener('mousemove', mouseMoveHandler);
    document.removeEventListener('click', clickHandler);
    document.removeEventListener('keypress', keyPressHandler);
    window.removeEventListener('scroll', scrollHandler);
    window.removeEventListener('resize', resizeHandler);
    window.removeEventListener('focus', focusHandler);
    window.removeEventListener('blur', focusHandler);
    window.removeEventListener('error', errorHandler);
    document.removeEventListener('focusin', formInteractionHandler);
    document.removeEventListener('focusout', formInteractionHandler);
    document.removeEventListener('input', formInteractionHandler);
    
    // 计算页面停留时间
    behavior.timeOnPage = Date.now() - behavior.pageLoadTime;
    
    return behavior;
  };
};

// 防抖函数
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// 限制请求频率
export const rateLimiter = {
  requests: [],
  maxRequests: 10,
  timeWindow: 60000,
  
  isAllowed() {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.timeWindow);
    
    if (this.requests.length >= this.maxRequests) {
      return false;
    }
    
    this.requests.push(now);
    return true;
  },
  
  getRemainingTime() {
    const now = Date.now();
    const oldestRequest = Math.min(...this.requests);
    return Math.max(0, this.timeWindow - (now - oldestRequest));
  }
};
