// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { FormField, FormItem, FormLabel, FormControl, FormMessage, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Textarea } from '@/components/ui';

// @ts-ignore;
import { validators } from '@/lib/security';
// @ts-ignore;
import { VALIDATION_RULES } from '@/constants/formConfig';

/**
 * 简化的表单字段组件
 * @description 提供统一的表单字段UI和验证逻辑
 * @param {Object} props - 组件属性
 * @param {Object} props.control - React Hook Form的control对象
 * @param {string} props.name - 字段名称
 * @param {string} props.label - 字段标签
 * @param {string} props.placeholder - 占位符文本
 * @param {string} props.type - 字段类型（text、select、textarea）
 * @param {React.ComponentType} props.icon - 图标组件
 * @param {Array} props.options - 选项列表（用于select类型）
 * @param {Object} props.validationRules - 验证规则
 * @param {string} props.className - 自定义CSS类名
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
   * @description 根据字段名称进行相应的验证
   * @param {string} value - 待验证的值
   * @returns {string|null} 错误信息或null（验证通过）
   */
  const validateField = value => {
    // 必填验证
    if (validationRules.required && !value) {
      return '此字段为必填项';
    }

    // 空值跳过其他验证
    if (!value) return null;

    // 根据字段名称进行特定验证
    switch (name) {
      case 'email':
        if (!validators.email(value)) {
          return '请输入有效的邮箱地址';
        }
        break;
      case 'power':
        if (!validators.power(value)) {
          return VALIDATION_RULES.POWER.MESSAGE;
        }
        break;
      case 'inletTemp':
      case 'outletTemp':
        if (!validators.temperature(value)) {
          return VALIDATION_RULES.TEMPERATURE.MESSAGE;
        }
        break;
      case 'flowRate':
        if (!validators.flowRate(value)) {
          return VALIDATION_RULES.FLOW_RATE.MESSAGE;
        }
        break;
      case 'pressure':
        if (!validators.pressure(value)) {
          return VALIDATION_RULES.PRESSURE.MESSAGE;
        }
        break;
      case 'additionalRequirements':
        if (!validators.textLength(value, 0, VALIDATION_RULES.TEXT_LENGTH.REQUIREMENTS_MAX)) {
          return VALIDATION_RULES.TEXT_LENGTH.REQUIREMENTS_MESSAGE;
        }
        break;
      case 'application':
        if (!validators.textLength(value, 0, VALIDATION_RULES.TEXT_LENGTH.APPLICATION_MAX)) {
          return VALIDATION_RULES.TEXT_LENGTH.APPLICATION_MESSAGE;
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
   * @description 根据类型渲染不同的表单控件
   * @param {Object} field - React Hook Form的field对象
   * @returns {React.Element} 表单控件元素
   */
  const renderField = field => {
    // 通用样式属性
    const commonProps = {
      ...field,
      placeholder,
      className: `backdrop-blur-lg bg-white/40 border-white/50 focus:border-blue-400 focus:ring-2 focus:ring-blue-200/50 rounded-lg h-11 text-sm transition-all duration-300 border ${className}`
    };

    // 根据类型渲染不同控件
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