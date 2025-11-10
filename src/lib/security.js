
/**
 * 表单验证工具库
 * 提供各种表单字段的验证函数和工具方法
 */

// ==================== 验证规则配置 ====================

/**
 * 验证器对象 - 包含各种表单字段的验证规则
 * @type {Object}
 */
export const validators = {
  /**
   * 邮箱格式验证
   * @param {string} email - 待验证的邮箱地址
   * @returns {boolean} 验证结果
   */
  email: (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  },
  
  /**
   * 功率验证 - 支持单个值或范围值
   * @param {string} power - 功率值，如 "100" 或 "50-200"
   * @returns {boolean} 验证结果
   */
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
  
  /**
   * 温度验证
   * @param {string} temp - 温度值
   * @returns {boolean} 验证结果
   */
  temperature: (temp) => {
    const value = parseFloat(temp);
    return !isNaN(value) && value >= -50 && value <= 500;
  },
  
  /**
   * 流量验证 - 支持单个值或范围值
   * @param {string} flowRate - 流量值，如 "50" 或 "20-100"
   * @returns {boolean} 验证结果
   */
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
  
  /**
   * 压力验证 - 支持单个值或范围值
   * @param {string} pressure - 压力值，如 "2.0" 或 "1.0-3.0"
   * @returns {boolean} 验证结果
   */
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
  
  /**
   * 文本长度验证
   * @param {string} text - 待验证的文本
   * @param {number} minLength - 最小长度
   * @param {number} maxLength - 最大长度
   * @returns {boolean} 验证结果
   */
  textLength: (text, minLength = 0, maxLength = 1000) => {
    return text && text.length >= minLength && text.length <= maxLength;
  }
};

// ==================== 工具函数 ====================

/**
 * 防抖函数 - 延迟执行函数，在指定时间内多次调用只执行最后一次
 * @param {Function} func - 要防抖的函数
 * @param {number} wait - 等待时间（毫秒）
 * @returns {Function} 防抖后的函数
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

// ==================== 常量定义 ====================

/**
 * 表单验证错误消息
 */
export const VALIDATION_MESSAGES = {
  REQUIRED: '此字段为必填项',
  EMAIL_INVALID: '请输入有效的邮箱地址',
  POWER_INVALID: '请输入有效的功率值 (0.1-10000 kW，支持范围值如 50-200)',
  TEMPERATURE_INVALID: '请输入有效的温度值 (-50°C 到 500°C)',
  FLOW_RATE_INVALID: '请输入有效的流量值 (0.1-10000 m³/h，支持范围值如 20-100)',
  PRESSURE_INVALID: '请输入有效的压力值 (0.1-50 MPa，支持范围值如 1.0-3.0)',
  TEXT_TOO_LONG: (maxLength) => `输入内容不能超过${maxLength}个字符`,
  ADDITIONAL_REQUIREMENTS_TOO_LONG: '附加要求不能超过500个字符',
  APPLICATION_TOO_LONG: '应用场景不能超过100个字符'
};

/**
 * 表单字段验证规则映射
 */
export const FIELD_VALIDATION_RULES = {
  email: {
    required: true,
    validate: validators.email
  },
  power: {
    required: true,
    validate: validators.power
  },
  inletTemp: {
    required: true,
    validate: validators.temperature
  },
  outletTemp: {
    required: true,
    validate: validators.temperature
  },
  flowRate: {
    required: true,
    validate: validators.flowRate
  },
  pressure: {
    required: true,
    validate: validators.pressure
  },
  heatExchangerType: {
    required: true
  },
  material: {
    required: true
  },
  application: {
    maxLength: 100,
    validate: (value) => validators.textLength(value, 0, 100) || VALIDATION_MESSAGES.APPLICATION_TOO_LONG
  },
  additionalRequirements: {
    maxLength: 500,
    validate: (value) => validators.textLength(value, 0, 500) || VALIDATION_MESSAGES.ADDITIONAL_REQUIREMENTS_TOO_LONG
  }
};
