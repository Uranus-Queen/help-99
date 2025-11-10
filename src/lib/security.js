
// 简化的表单验证工具

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
  }
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
