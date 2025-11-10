// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { FormField, FormItem, FormLabel, FormControl, FormMessage, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Textarea } from '@/components/ui';

import { getFieldErrorMessage } from '@/lib/security';

/**
 * 简化的表单字段组件
 * @param {Object} props - 组件属性
 * @param {Object} props.control - React Hook Form control对象
 * @param {string} props.name - 字段名称
 * @param {string} props.label - 字段标签
 * @param {string} props.placeholder - 占位符文本
 * @param {string} props.type - 字段类型 (text, select, textarea)
 * @param {React.Component} props.icon - 图标组件
 * @param {Array} props.options - 选择项选项 (用于select类型)
 * @param {Object} props.validationRules - 验证规则
 * @param {string} props.className - 自定义样式类名
 * @returns {React.Component} - 表单字段组件
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
   * @param {any} value - 字段值
   * @returns {string|null} - 错误信息或null
   */
  const validateField = value => {
    return getFieldErrorMessage(name, value, validationRules);
  };

  /**
   * 渲染不同类型的输入字段
   * @param {Object} field - 字段对象
   * @returns {React.Component} - 输入字段组件
   */
  const renderField = field => {
    // 通用样式配置
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
          {/* 字段标签 */}
          <FormLabel className="text-gray-700 font-semibold flex items-center gap-2 mb-3 text-sm drop-shadow-sm">
            {Icon && <Icon className="w-4 h-4 text-blue-500 drop-shadow-sm" />}
            {label}
          </FormLabel>
          
          {/* 字段控件 */}
          <FormControl>
            {renderField(field)}
          </FormControl>
          
          {/* 错误信息 */}
          <FormMessage className="text-red-500 font-medium mt-2 text-sm drop-shadow-sm" />
        </FormItem>} />;
}