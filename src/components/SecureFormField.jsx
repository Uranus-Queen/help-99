// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { FormField, FormItem, FormLabel, FormControl, FormMessage, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Textarea } from '@/components/ui';

// @ts-ignore;
import { validators, VALIDATION_MESSAGES } from '@/lib/security';

/**
 * 简化表单字段组件属性
 * @typedef {Object} SimpleFormFieldProps
 * @property {Object} control - React Hook Form 的 control 对象
 * @property {string} name - 字段名称
 * @property {string} label - 字段标签
 * @property {string} placeholder - 占位符文本
 * @property {string} type - 字段类型 ('text' | 'select' | 'textarea')
 * @property {React.ComponentType} icon - 图标组件
 * @property {Array<{value: string, label: string}>} options - 选项列表（用于 select 类型）
 * @property {Object} validationRules - 验证规则
 * @property {string} className - 自定义 CSS 类名
 */

/**
 * 简化表单字段组件
 * @param {SimpleFormFieldProps} props - 组件属性
 * @returns {JSX.Element} 表单字段组件
 */
export function SimpleFormField({
  control,
  name,
  label,
  placeholder,
  type = 'text',
  icon: Icon,
  options = [],
  validationRules = {},
  className = '',
  ...props
}) {
  /**
   * 字段验证函数
   * 根据字段名称和验证规则进行验证
   * @param {string} value - 待验证的值
   * @returns {string|null} 错误消息或 null（验证通过）
   */
  const validateField = value => {
    // 必填验证
    if (validationRules.required && !value) {
      return VALIDATION_MESSAGES.REQUIRED;
    }

    // 空值跳过其他验证
    if (!value) return null;

    // 根据字段名称进行特定验证
    switch (name) {
      case 'email':
        if (!validators.email(value)) {
          return VALIDATION_MESSAGES.EMAIL_INVALID;
        }
        break;
      case 'power':
        if (!validators.power(value)) {
          return VALIDATION_MESSAGES.POWER_INVALID;
        }
        break;
      case 'inletTemp':
      case 'outletTemp':
        if (!validators.temperature(value)) {
          return VALIDATION_MESSAGES.TEMPERATURE_INVALID;
        }
        break;
      case 'flowRate':
        if (!validators.flowRate(value)) {
          return VALIDATION_MESSAGES.FLOW_RATE_INVALID;
        }
        break;
      case 'pressure':
        if (!validators.pressure(value)) {
          return VALIDATION_MESSAGES.PRESSURE_INVALID;
        }
        break;
      case 'additionalRequirements':
        if (!validators.textLength(value, 0, 500)) {
          return VALIDATION_MESSAGES.ADDITIONAL_REQUIREMENTS_TOO_LONG;
        }
        break;
      case 'application':
        if (!validators.textLength(value, 0, 100)) {
          return VALIDATION_MESSAGES.APPLICATION_TOO_LONG;
        }
        break;
      default:
        // 通用长度验证
        if (validationRules.maxLength && value.length > validationRules.maxLength) {
          return VALIDATION_MESSAGES.TEXT_TOO_LONG(validationRules.maxLength);
        }
    }
    return null;
  };

  /**
   * 渲染不同类型的输入字段
   * @param {Object} field - React Hook Form 的 field 对象
   * @returns {JSX.Element} 输入字段组件
   */
  const renderField = field => {
    // 通用样式属性
    const commonProps = {
      ...field,
      placeholder,
      className: `backdrop-blur-lg bg-white/40 border-white/50 focus:border-blue-400 focus:ring-2 focus:ring-blue-200/50 rounded-lg h-11 text-sm transition-all duration-300 border ${className}`
    };
    switch (type) {
      case 'select':
        return <Select onValueChange={field.onChange} defaultValue={field.value}>
            <SelectTrigger className={commonProps.className}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent className="backdrop-blur-xl bg-white/40 border border-white/40">
              {options.map(option => <SelectItem key={option.value} value={option.value} className="hover:bg-blue-50/50 text-sm">
                  {option.label}
                </SelectItem>)}
            </SelectContent>
          </Select>;
      case 'textarea':
        return <Textarea {...commonProps} rows={3} className={`resize-none rounded-lg transition-all duration-300 border text-sm ${commonProps.className}`} />;
      default:
        return <Input {...commonProps} />;
    }
  };
  return <FormField control={control} name={name} rules={{
    validate: validateField,
    ...validationRules
  }} render={({
    field
  }) => <FormItem>
          <FormLabel className="text-gray-700 font-semibold flex items-center gap-2 mb-3 text-sm drop-shadow-sm">
            {Icon && <Icon className="w-4 h-4 text-blue-500 drop-shadow-sm" />}
            {label}
          </FormLabel>
          <FormControl>
            {renderField(field)}
          </FormControl>
          <FormMessage className="text-red-500 font-medium mt-2 text-sm drop-shadow-sm" />
        </FormItem>} />;
}