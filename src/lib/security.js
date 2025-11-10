
// ========================================
// 表单验证工具库
// 提供各种表单字段的验证功能
// ========================================

// ========================================
// 常量定义 - 验证规则配置
// ========================================

// 验证规则常量
export const VALIDATION_RULES = {
  // 邮箱验证规则
  EMAIL: {
    PATTERN: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    ERROR_MESSAGE: '请输入有效的邮箱地址'
  },
  
  // 功率验证规则 (kW)
  POWER: {
    PATTERN: /^(\d+(\.\d+)?)(-\d+(\.\d+)?)?$/,
    MIN_VALUE: 0.1,
    MAX_VALUE: 10000,
    ERROR_MESSAGE: '请输入有效的功率值 (0.1-10000 kW，支持范围值如 50-200)'
  },
  
  // 温度验证规则 (°C)
  TEMPERATURE: {
    MIN_VALUE: -50,
    MAX_VALUE: 500,
    ERROR_MESSAGE: '请输入有效的温度值 (-50°C 到 500°C)'
  },
  
  // 流量验证规则 (m³/h)
  FLOW_RATE: {
    PATTERN: /^(\d+(\.\d+)?)(-\d+(\.\d+)?)?$/,
    MIN_VALUE: 0.1,
    MAX_VALUE: 10000,
    ERROR_MESSAGE: '请输入有效的流量值 (0.1-10000 m³/h，支持范围值如 20-100)'
  },
  
  // 压力验证规则 (MPa)
  PRESSURE: {
    PATTERN: /^(\d+(\.\d+)?)(-\d+(\.\d+)?)?$/,
    MIN_VALUE: 0.1,
    MAX_VALUE: 50,
    ERROR_MESSAGE: '请输入有效的压力值 (0.1-50 MPa，支持范围值如 1.0-3.0)'
  },
  
  // 文本长度验证规则
  TEXT_LENGTH: {
    APPLICATION_MAX: 100,
    REQUIREMENTS_MAX: 500,
    ERROR_MESSAGE: '输入内容过长'
  }
};

// ========================================
// 验证工具函数
// ========================================

/**
 * 验证邮箱格式
 * @param {string} email - 邮箱地址
 * @returns {boolean} - 验证结果
 */
export const validators = {
  /**
   * 验证邮箱格式
   * @param {string} email - 邮箱地址
   * @returns {boolean} - 验证结果
   */
  email: (email) => {
    if (!email) return false;
    return VALIDATION_RULES.EMAIL.PATTERN.test(email);
  },
  
  /**
   * 验证功率值 (支持范围值)
   * @param {string} power - 功率值，如 "100" 或 "50-200"
   * @returns {boolean} - 验证结果
   */
  power: (power) => {
    if (!power) return false;
    
    // 检查格式
    if (!VALIDATION_RULES.POWER.PATTERN.test(power)) {
      return false;
    }
    
    const parts = power.split('-');
    
    if (parts.length === 1) {
      // 单个值验证
      const value = parseFloat(parts[0]);
      return value >= VALIDATION_RULES.POWER.MIN_VALUE && 
             value <= VALIDATION_RULES.POWER.MAX_VALUE;
    } else if (parts.length === 2) {
      // 范围值验证
      const min = parseFloat(parts[0]);
      const max = parseFloat(parts[1]);
      return min >= VALIDATION_RULES.POWER.MIN_VALUE && 
             max <= VALIDATION_RULES.POWER.MAX_VALUE && 
             min < max;
    }
    
    return false;
  },
  
  /**
   * 验证温度值
   * @param {string} temp - 温度值
   * @returns {boolean} - 验证结果
   */
  temperature: (temp) => {
    if (!temp) return false;
    const value = parseFloat(temp);
    return !isNaN(value) && 
           value >= VALIDATION_RULES.TEMPERATURE.MIN_VALUE && 
           value <= VALIDATION_RULES.TEMPERATURE.MAX_VALUE;
  },
  
  /**
   * 验证流量值 (支持范围值)
   * @param {string} flowRate - 流量值，如 "50" 或 "20-100"
   * @returns {boolean} - 验证结果
   */
  flowRate: (flowRate) => {
    if (!flowRate) return false;
    
    // 检查格式
    if (!VALIDATION_RULES.FLOW_RATE.PATTERN.test(flowRate)) {
      return false;
    }
    
    const parts = flowRate.split('-');
    
    if (parts.length === 1) {
      // 单个值验证
      const value = parseFloat(parts[0]);
      return value >= VALIDATION_RULES.FLOW_RATE.MIN_VALUE && 
             value <= VALIDATION_RULES.FLOW_RATE.MAX_VALUE;
    } else if (parts.length === 2) {
      // 范围值验证
      const min = parseFloat(parts[0]);
      const max = parseFloat(parts[1]);
      return min >= VALIDATION_RULES.FLOW_RATE.MIN_VALUE && 
             max <= VALIDATION_RULES.FLOW_RATE.MAX_VALUE && 
             min < max;
    }
    
    return false;
  },
  
  /**
   * 验证压力值 (支持范围值)
   * @param {string} pressure - 压力值，如 "2.0" 或 "1.0-3.0"
   * @returns {boolean} - 验证结果
   */
  pressure: (pressure) => {
    if (!pressure) return false;
    
    // 检查格式
    if (!VALIDATION_RULES.PRESSURE.PATTERN.test(pressure)) {
      return false;
    }
    
    const parts = pressure.split('-');
    
    if (parts.length === 1) {
      // 单个值验证
      const value = parseFloat(parts[0]);
      return value >= VALIDATION_RULES.PRESSURE.MIN_VALUE && 
             value <= VALIDATION_RULES.PRESSURE.MAX_VALUE;
    } else if (parts.length === 2) {
      // 范围值验证
      const min = parseFloat(parts[0]);
      const max = parseFloat(parts[1]);
      return min >= VALIDATION_RULES.PRESSURE.MIN_VALUE && 
             max <= VALIDATION_RULES.PRESSURE.MAX_VALUE && 
             min < max;
    }
    
    return false;
  },
  
  /**
   * 验证文本长度
   * @param {string} text - 文本内容
   * @param {number} minLength - 最小长度
   * @param {number} maxLength - 最大长度
   * @returns {boolean} - 验证结果
   */
  textLength: (text, minLength = 0, maxLength = 1000) => {
    return text && text.length >= minLength && text.length <= maxLength;
  }
};

// ========================================
// 工具函数
// ========================================

/**
 * 防抖函数 - 延迟执行函数调用
 * @param {Function} func - 要执行的函数
 * @param {number} wait - 延迟时间(毫秒)
 * @returns {Function} - 防抖后的函数
 */
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

/**
 * 获取字段验证错误信息
 * @param {string} fieldName - 字段名称
 * @param {any} value - 字段值
 * @param {Object} validationRules - 验证规则
 * @returns {string|null} - 错误信息或null
 */
export const getFieldErrorMessage = (fieldName, value, validationRules = {}) => {
  // 必填验证
  if (validationRules.required && !value) {
    return '此字段为必填项';
  }
  
  // 如果值为空且不是必填，跳过其他验证
  if (!value) return null;
  
  // 根据字段类型进行验证
  switch (fieldName) {
    case 'email':
      if (!validators.email(value)) {
        return VALIDATION_RULES.EMAIL.ERROR_MESSAGE;
      }
      break;
      
    case 'power':
      if (!validators.power(value)) {
        return VALIDATION_RULES.POWER.ERROR_MESSAGE;
      }
      break;
      
    case 'inletTemp':
    case 'outletTemp':
      if (!validators.temperature(value)) {
        return VALIDATION_RULES.TEMPERATURE.ERROR_MESSAGE;
      }
      break;
      
    case 'flowRate':
      if (!validators.flowRate(value)) {
        return VALIDATION_RULES.FLOW_RATE.ERROR_MESSAGE;
      }
      break;
      
    case 'pressure':
      if (!validators.pressure(value)) {
        return VALIDATION_RULES.PRESSURE.ERROR_MESSAGE;
      }
      break;
      
    case 'additionalRequirements':
      if (!validators.textLength(value, 0, VALIDATION_RULES.TEXT_LENGTH.REQUIREMENTS_MAX)) {
        return `附加要求不能超过${VALIDATION_RULES.TEXT_LENGTH.REQUIREMENTS_MAX}个字符`;
      }
      break;
      
    case 'application':
      if (!validators.textLength(value, 0, VALIDATION_RULES.TEXT_LENGTH.APPLICATION_MAX)) {
        return `应用场景不能超过${VALIDATION_RULES.TEXT_LENGTH.APPLICATION_MAX}个字符`;
      }
      break;
      
    default:
      // 通用长度验证
      if (validationRules.maxLength && value.length > validationRules.maxLength) {
        return `输入内容不能超过${validationRules.maxLength}个字符`;
      }
  }
  
  return null;
};
