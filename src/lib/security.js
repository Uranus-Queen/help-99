
/**
 * 表单验证工具库
 * @description 提供各种表单验证函数和工具方法
 */

/**
 * 输入验证函数集合
 * @description 包含各种数据类型的验证逻辑
 */
export const validators = {
  /**
   * 验证邮箱格式
   * @param {string} email - 待验证的邮箱地址
   * @returns {boolean} 是否为有效邮箱格式
   */
  email: (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  },
  
  /**
   * 验证功率值（支持范围值）
   * @param {string} power - 功率值，支持单个值或范围值（如 "100" 或 "50-200"）
   * @returns {boolean} 是否为有效功率值
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
   * 验证温度值
   * @param {string|number} temp - 温度值
   * @returns {boolean} 是否为有效温度值（-50°C 到 500°C）
   */
  temperature: (temp) => {
    const value = parseFloat(temp);
    return !isNaN(value) && value >= -50 && value <= 500;
  },
  
  /**
   * 验证流量值（支持范围值）
   * @param {string} flowRate - 流量值，支持单个值或范围值
   * @returns {boolean} 是否为有效流量值
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
   * 验证压力值（支持范围值）
   * @param {string} pressure - 压力值，支持单个值或范围值
   * @returns {boolean} 是否为有效压力值
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
   * 验证文本长度
   * @param {string} text - 待验证的文本
   * @param {number} minLength - 最小长度
   * @param {number} maxLength - 最大长度
   * @returns {boolean} 是否在指定长度范围内
   */
  textLength: (text, minLength = 0, maxLength = 1000) => {
    return text && text.length >= minLength && text.length <= maxLength;
  }
};

/**
 * 防抖函数
 * @description 延迟执行函数，在指定时间内多次调用只执行最后一次
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
