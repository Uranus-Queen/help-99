
/**
 * 表单验证工具库
 * 提供各种表单字段的验证函数和通用工具方法
 */

/**
 * 输入验证器对象
 * 包含各种表单字段的验证规则
 */
export const validators = {
  /**
   * 验证邮箱格式
   * @param {string} email - 待验证的邮箱地址
   * @returns {boolean} - 验证结果
   */
  email: (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  },
  
  /**
   * 验证功率值（支持范围值）
   * @param {string} power - 功率值，支持单个值或范围值（如：100 或 50-200）
   * @returns {boolean} - 验证结果
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
   * @param {string} temp - 温度值
   * @returns {boolean} - 验证结果
   */
  temperature: (temp) => {
    const value = parseFloat(temp);
    return !isNaN(value) && value >= -50 && value <= 500;
  },
  
  /**
   * 验证流量值（支持范围值）
   * @param {string} flowRate - 流量值，支持单个值或范围值
   * @returns {boolean} - 验证结果
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
   * @returns {boolean} - 验证结果
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
   * @returns {boolean} - 验证结果
   */
  textLength: (text, minLength = 0, maxLength = 1000) => {
    return text && text.length >= minLength && text.length <= maxLength;
  }
};

/**
 * 防抖函数
 * @param {Function} func - 需要防抖的函数
 * @param {number} wait - 等待时间（毫秒）
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
