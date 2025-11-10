// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Gauge, Waves, Sparkles, Mail, Building2, Zap, Thermometer, Wind, Droplets } from 'lucide-react';

// @ts-ignore;
import { SimpleFormField } from '@/components/SecureFormField';
// @ts-ignore;

// ==================== 常量定义 ====================

/**
 * 换热器类型选项
 */
export const HEAT_EXCHANGER_TYPES = [{
  value: 'shell-tube',
  label: '管壳式'
}, {
  value: 'plate',
  label: '板式'
}, {
  value: 'air-cooled',
  label: '空冷式'
}, {
  value: 'spiral',
  label: '螺旋板式'
}, {
  value: 'other',
  label: '其他'
}];

/**
 * 材质选项
 */
export const MATERIALS = [{
  value: 'stainless-steel',
  label: '不锈钢'
}, {
  value: 'carbon-steel',
  label: '碳钢'
}, {
  value: 'titanium',
  label: '钛合金'
}, {
  value: 'copper',
  label: '铜合金'
}, {
  value: 'aluminum',
  label: '铝合金'
}];

// ==================== 区块组件 ====================

/**
 * 核心参数区块组件
 * 包含换热器类型、功率、进出口温度等核心参数
 * @param {Object} props - 组件属性
 * @param {Object} props.control - React Hook Form 的 control 对象
 * @returns {JSX.Element} 核心参数区块
 */
export function CoreParametersSection({
  control
}) {
  return <div className="space-y-4 sm:space-y-6">
      {/* 区块标题 */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-red-500/90 to-orange-500/90 rounded-xl flex items-center justify-center shadow-lg border border-white/40 backdrop-blur-lg">
          <Gauge className="w-4 h-4 sm:w-5 sm:h-5 text-white drop-shadow-md" />
        </div>
        <h3 className="text-lg sm:text-xl font-semibold text-gray-800 drop-shadow-sm">核心参数</h3>
      </div>
      
      {/* 表单字段网格布局 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* 左列字段 */}
        <div className="space-y-4">
          <SimpleFormField control={control} name="heatExchangerType" label="换热器类型 *" placeholder="选择类型" type="select" icon={Building2} options={HEAT_EXCHANGER_TYPES} validationRules={{
          required: true
        }} />

          <SimpleFormField control={control} name="power" label="功率 (kW) *" placeholder="如: 100 或 50-200" icon={Zap} validationRules={{
          required: true
        }} />
        </div>

        {/* 右列字段 */}
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
 * 流体与材质区块组件
 * 包含流量、压力、材质、应用场景等参数
 * @param {Object} props - 组件属性
 * @param {Object} props.control - React Hook Form 的 control 对象
 * @returns {JSX.Element} 流体与材质区块
 */
export function FluidAndMaterialSection({
  control
}) {
  return <div className="space-y-4 sm:space-y-6">
      {/* 区块标题 */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-cyan-500/90 to-blue-500/90 rounded-xl flex items-center justify-center shadow-lg border border-white/40 backdrop-blur-lg">
          <Waves className="w-4 h-4 sm:w-5 sm:h-5 text-white drop-shadow-md" />
        </div>
        <h3 className="text-lg sm:text-xl font-semibold text-gray-800 drop-shadow-sm">流体与材质</h3>
      </div>
      
      {/* 表单字段网格布局 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* 左列字段 */}
        <div className="space-y-4">
          <SimpleFormField control={control} name="flowRate" label="流量 (m³/h) *" placeholder="如: 50 或 20-100" icon={Wind} validationRules={{
          required: true
        }} />

          <SimpleFormField control={control} name="pressure" label="压力 (MPa) *" placeholder="如: 2.0 或 1.0-3.0" icon={Droplets} validationRules={{
          required: true
        }} />
        </div>

        {/* 右列字段 */}
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
 * 特殊要求区块组件
 * 包含附加要求的文本输入区域
 * @param {Object} props - 组件属性
 * @param {Object} props.control - React Hook Form 的 control 对象
 * @returns {JSX.Element} 特殊要求区块
 */
export function SpecialRequirementsSection({
  control
}) {
  return <div className="space-y-4">
      {/* 区块标题 */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-500/90 to-emerald-500/90 rounded-xl flex items-center justify-center shadow-lg border border-white/40 backdrop-blur-lg">
          <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white drop-shadow-md" />
        </div>
        <h3 className="text-lg sm:text-xl font-semibold text-gray-800 drop-shadow-sm">特殊要求</h3>
      </div>
      
      {/* 文本区域 */}
      <div className="backdrop-blur-xl bg-white/30 rounded-xl p-4 border border-white/40 shadow-lg transition-all duration-300 hover:shadow-xl hover:bg-white/40">
        <SimpleFormField control={control} name="additionalRequirements" label="附加要求" placeholder="请描述其他特殊要求或技术细节..." type="textarea" validationRules={{
        maxLength: 500
      }} />
      </div>
    </div>;
}

/**
 * 联系信息区块组件
 * 包含邮箱地址输入
 * @param {Object} props - 组件属性
 * @param {Object} props.control - React Hook Form 的 control 对象
 * @returns {JSX.Element} 联系信息区块
 */
export function ContactSection({
  control
}) {
  return <div className="backdrop-blur-xl bg-white/30 rounded-xl p-6 border border-white/40 shadow-lg transition-all duration-300 hover:shadow-xl hover:bg-white/40">
      {/* 区块标题 */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500/90 to-purple-600/90 rounded-xl flex items-center justify-center shadow-lg border border-white/40 backdrop-blur-lg">
          <Mail className="w-5 h-5 text-white drop-shadow-md" />
        </div>
        <h3 className="text-lg font-bold text-gray-800 drop-shadow-sm">联系邮箱 *</h3>
      </div>
      
      {/* 邮箱输入字段 */}
      <SimpleFormField control={control} name="email" placeholder="请输入您的邮箱地址" validationRules={{
      required: true
    }} className="pl-10 pr-4 py-3 text-base" />
    </div>;
}