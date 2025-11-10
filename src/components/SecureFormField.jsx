// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { FormField, FormItem, FormLabel, FormControl, FormMessage, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Textarea } from '@/components/ui';

import { validators } from '@/lib/security';

/**
 * 表单字段组件属性
 * @typedef {Object} SimpleFormFieldProps
 * @property {Object} control - React Hook Form 的 control 对象
 * @property {string} name - 字段名称
 * @property {string} label - 字段标签
 * @property {string} placeholder - 占位符文本
 * @property {string} type - 字段类型（text、select、textarea）
 * @property {React.ComponentType} icon - 图标组件
 * @property {Array<{value: string, label: string}>} options - 选项列表（用于 select 类型）
 * @property {Object} validationRules - 验证规则
 * @property {string} className - 自定义 CSS 类名
 */

/**
 * 简化的表单字段组件
 * @param {SimpleFormFieldProps} props - 组件属性
 * @returns {JSX.Element} - 表单字段组件
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
   * 验证字段值
   * @param {string} value - 待验证的值
   * @returns {string|null} - 错误信息或 null（验证通过）
   */
  const validateField = value => {
    // 必填验证
    if (validationRules.required && !value) {
      return '此字段为必填项';
    }

    // 空值跳过其他验证
    if (!value) return null;

    // 根据字段名进行特定验证
    switch (name) {
      case 'email':
        if (!validators.email(value)) {
          return '请输入有效的邮箱地址';
        }
        break;
      case 'power':
        if (!validators.power(value)) {
          return '请输入有效的功率值 (0.1-10000 kW，支持范围值如 50-200)';
        }
        break;
      case 'inletTemp':
      case 'outletTemp':
        if (!validators.temperature(value)) {
          return '请输入有效的温度值 (-50°C 到 500°C)';
        }
        break;
      case 'flowRate':
        if (!validators.flowRate(value)) {
          return '请输入有效的流量值 (0.1-10000 m³/h，支持范围值如 20-100)';
        }
        break;
      case 'pressure':
        if (!validators.pressure(value)) {
          return '请输入有效的压力值 (0.1-50 MPa，支持范围值如 1.0-3.0)';
        }
        break;
      case 'additionalRequirements':
        if (!validators.textLength(value, 0, 500)) {
          return '附加要求不能超过500个字符';
        }
        break;
      case 'application':
        if (!validators.textLength(value, 0, 100)) {
          return '应用场景不能超过100个字符';
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

  /**
   * 渲染表单控件
   * @param {Object} field - React Hook Form 的 field 对象
   * @returns {JSX.Element} - 表单控件
   */
  const renderField = field => {
    // 通用样式属性
    const commonProps = {
      ...field,
      placeholder,
      className: `backdrop-blur-lg bg-white/40 border-white/50 focus:border-blue-400 focus:ring-2 focus:ring-blue-200/50 rounded-lg h-11 text-sm transition-all duration-300 border ${className}`
    };

    // 根据类型渲染不同的控件
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