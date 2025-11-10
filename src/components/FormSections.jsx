// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Gauge, Waves, Sparkles, Mail, Building2, Zap, Thermometer, Wind, Droplets } from 'lucide-react';

// @ts-ignore;
import { SimpleFormField } from '@/components/SimpleFormField';
// @ts-ignore;
import { HEAT_EXCHANGER_TYPES, MATERIALS } from '@/constants/formConfig';
// @ts-ignore;

/**
 * 核心参数表单区域
 * @param {Object} props - 组件属性
 * @param {Object} props.control - React Hook Form的control对象
 * @returns {React.Element} 核心参数表单区域
 */
export function CoreParametersSection({
  control
}) {
  return <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-red-500/90 to-orange-500/90 rounded-xl flex items-center justify-center shadow-lg border border-white/40 backdrop-blur-lg">
          <Gauge className="w-4 h-4 sm:w-5 sm:h-5 text-white drop-shadow-md" />
        </div>
        <h3 className="text-lg sm:text-xl font-semibold text-gray-800 drop-shadow-sm">核心参数</h3>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="space-y-4">
          <SimpleFormField control={control} name="heatExchangerType" label="换热器类型 *" placeholder="选择类型" type="select" icon={Building2} options={HEAT_EXCHANGER_TYPES} validationRules={{
          required: true
        }} />

          <SimpleFormField control={control} name="power" label="功率 (kW) *" placeholder="如: 100 或 50-200" icon={Zap} validationRules={{
          required: true
        }} />
        </div>

        <div className="space-y-4">
          <SimpleFormField control={control} name="inletTemp" label="进口温度 (°C) *" placeholder="如: 80" icon={Thermometer} validationRules={{
          required: true
        }} />

          <SimpleFormField control={control} name="outletTemp" label="出口温度 (°C) *" placeholder="如: 40" icon={Thermometer} validationRules={{
          required: true
        }} />
        </div>
      </div>
    </div>;
}

/**
 * 流体与材质表单区域
 * @param {Object} props - 组件属性
 * @param {Object} props.control - React Hook Form的control对象
 * @returns {React.Element} 流体与材质表单区域
 */
export function FluidAndMaterialSection({
  control
}) {
  return <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-cyan-500/90 to-blue-500/90 rounded-xl flex items-center justify-center shadow-lg border border-white/40 backdrop-blur-lg">
          <Waves className="w-4 h-4 sm:w-5 sm:h-5 text-white drop-shadow-md" />
        </div>
        <h3 className="text-lg sm:text-xl font-semibold text-gray-800 drop-shadow-sm">流体与材质</h3>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="space-y-4">
          <SimpleFormField control={control} name="flowRate" label="流量 (m³/h) *" placeholder="如: 50 或 20-100" icon={Wind} validationRules={{
          required: true
        }} />

          <SimpleFormField control={control} name="pressure" label="压力 (MPa) *" placeholder="如: 2.0 或 1.0-3.0" icon={Droplets} validationRules={{
          required: true
        }} />
        </div>

        <div className="space-y-4">
          <SimpleFormField control={control} name="material" label="材质要求 *" placeholder="选择材质" type="select" options={MATERIALS} validationRules={{
          required: true
        }} />

          <SimpleFormField control={control} name="application" label="应用场景" placeholder="如: 化工、制冷、空调等" validationRules={{
          maxLength: 100
        }} />
        </div>
      </div>
    </div>;
}

/**
 * 特殊要求表单区域
 * @param {Object} props - 组件属性
 * @param {Object} props.control - React Hook Form的control对象
 * @returns {React.Element} 特殊要求表单区域
 */
export function SpecialRequirementsSection({
  control
}) {
  return <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-500/90 to-emerald-500/90 rounded-xl flex items-center justify-center shadow-lg border border-white/40 backdrop-blur-lg">
          <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white drop-shadow-md" />
        </div>
        <h3 className="text-lg sm:text-xl font-semibold text-gray-800 drop-shadow-sm">特殊要求</h3>
      </div>
      
      <div className="backdrop-blur-xl bg-white/30 rounded-xl p-4 border border-white/40 shadow-lg transition-all duration-300 hover:shadow-xl hover:bg-white/40">
        <SimpleFormField control={control} name="additionalRequirements" label="附加要求" placeholder="请描述其他特殊要求或技术细节..." type="textarea" validationRules={{
        maxLength: 500
      }} />
      </div>
    </div>;
}

/**
 * 联系邮箱表单区域
 * @param {Object} props - 组件属性
 * @param {Object} props.control - React Hook Form的control对象
 * @returns {React.Element} 联系邮箱表单区域
 */
export function ContactEmailSection({
  control
}) {
  return <div className="backdrop-blur-xl bg-white/30 rounded-xl p-6 border border-white/40 shadow-lg transition-all duration-300 hover:shadow-xl hover:bg-white/40">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500/90 to-purple-600/90 rounded-xl flex items-center justify-center shadow-lg border border-white/40 backdrop-blur-lg">
          <Mail className="w-5 h-5 text-white drop-shadow-md" />
        </div>
        <h3 className="text-lg font-bold text-gray-800 drop-shadow-sm">联系邮箱 *</h3>
      </div>
      
      <SimpleFormField control={control} name="email" placeholder="请输入您的邮箱地址" validationRules={{
      required: true
    }} className="pl-10 pr-4 py-3 text-base" />
    </div>;
}