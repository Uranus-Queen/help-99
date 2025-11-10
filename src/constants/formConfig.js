
/**
 * 表单配置常量
 * @description 定义表单选项、验证规则等配置信息
 */

// 换热器类型选项
export const HEAT_EXCHANGER_TYPES = [
  { value: 'shell-tube', label: '管壳式' },
  { value: 'plate', label: '板式' },
  { value: 'air-cooled', label: '空冷式' },
  { value: 'spiral', label: '螺旋板式' },
  { value: 'other', label: '其他' }
];

// 材质选项
export const MATERIALS = [
  { value: 'stainless-steel', label: '不锈钢' },
  { value: 'carbon-steel', label: '碳钢' },
  { value: 'titanium', label: '钛合金' },
  { value: 'copper', label: '铜合金' },
  { value: 'aluminum', label: '铝合金' }
];

// 验证规则配置
export const VALIDATION_RULES = {
  // 功率范围 (kW)
  POWER: {
    MIN: 0.1,
    MAX: 10000,
    MESSAGE: '请输入有效的功率值 (0.1-10000 kW，支持范围值如 50-200)'
  },
  
  // 温度范围 (°C)
  TEMPERATURE: {
    MIN: -50,
    MAX: 500,
    MESSAGE: '请输入有效的温度值 (-50°C 到 500°C)'
  },
  
  // 流量范围 (m³/h)
  FLOW_RATE: {
    MIN: 0.1,
    MAX: 10000,
    MESSAGE: '请输入有效的流量值 (0.1-10000 m³/h，支持范围值如 20-100)'
  },
  
  // 压力范围 (MPa)
  PRESSURE: {
    MIN: 0.1,
    MAX: 50,
    MESSAGE: '请输入有效的压力值 (0.1-50 MPa，支持范围值如 1.0-3.0)'
  },
  
  // 文本长度限制
  TEXT_LENGTH: {
    APPLICATION_MAX: 100,
    REQUIREMENTS_MAX: 500,
    APPLICATION_MESSAGE: '应用场景不能超过100个字符',
    REQUIREMENTS_MESSAGE: '附加要求不能超过500个字符'
  }
};

// 表单默认值
export const DEFAULT_FORM_VALUES = {
  heatExchangerType: '',
  power: '',
  inletTemp: '',
  outletTemp: '',
  flowRate: '',
  pressure: '',
  material: '',
  application: '',
  additionalRequirements: '',
  email: ''
};

// 动画配置
export const ANIMATION_CONFIG = {
  DURATION: {
    FAST: 300,
    NORMAL: 500,
    SLOW: 1000
  },
  FLOAT_DURATION: {
    FLOAT_1: '8s',
    FLOAT_2: '10s',
    FLOAT_3: '7s',
    FLOAT_4: '9s',
    FLOAT_5: '12s',
    FLOAT_6: '11s',
    FLOAT_7: '6s',
    FLOAT_8: '9.5s'
  }
};

// UI配置
export const UI_CONFIG = {
  // 响应式断点
  BREAKPOINTS: {
    SM: '640px',
    MD: '768px',
    LG: '1024px',
    XL: '1280px'
  },
  
  // 延迟时间
  DELAYS: {
    DEBOUNCE: 500,
    SUBMIT_SIMULATION: 2000,
    PAGE_LOAD: 100
  },
  
  // 最大记录数
  LIMITS: {
    MOUSE_MOVEMENTS: 100,
    SCROLL_EVENTS: 50
  }
};
