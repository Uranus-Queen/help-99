// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Form, Button } from '@/components/ui';
// @ts-ignore;
import { Settings, Sparkles, ArrowRight, Loader2 } from 'lucide-react';

// @ts-ignore;
import { CoreParametersSection } from '@/components/FormSections';
// @ts-ignore;
import { FluidAndMaterialSection } from '@/components/FormSections';
// @ts-ignore;
import { SpecialRequirementsSection } from '@/components/FormSections';
// @ts-ignore;
import { ContactEmailSection } from '@/components/FormSections';

/**
 * 表单容器组件
 * @param {Object} props - 组件属性
 * @param {Object} props.form - React Hook Form的form对象
 * @param {Function} props.onSubmit - 表单提交函数
 * @param {boolean} props.isSubmitting - 是否正在提交
 * @returns {React.Element} 表单容器
 */
export function FormContainer({
  form,
  onSubmit,
  isSubmitting
}) {
  return <div className="backdrop-blur-3xl bg-white/20 border border-white/40 shadow-2xl rounded-2xl sm:rounded-3xl overflow-hidden">
      {/* 表单头部 */}
      <div className="bg-gradient-to-r from-blue-500/90 via-purple-500/90 to-pink-500/90 p-4 sm:p-5 backdrop-blur-md border-b border-white/30">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/30 backdrop-blur-lg rounded-xl flex items-center justify-center border border-white/40">
              <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-white drop-shadow-md" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white drop-shadow-md">技术参数表单</h2>
              <p className="text-white/90 text-sm drop-shadow-sm">精确配置，专业定制</p>
            </div>
          </div>
          <div className="flex items-center gap-2 justify-center sm:justify-start backdrop-blur-sm bg-white/20 rounded-full px-3 py-1 border border-white/30">
            <Sparkles className="w-4 h-4 text-yellow-300 drop-shadow-sm" />
            <span className="text-white/90 text-sm drop-shadow-sm">智能推荐</span>
          </div>
        </div>
      </div>
      
      {/* 表单内容 */}
      <div className="p-4 sm:p-6 lg:p-8 backdrop-blur-md bg-white/10">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 sm:space-y-8">
            {/* 核心参数区域 */}
            <CoreParametersSection control={form.control} />
            
            {/* 流体与材质区域 */}
            <FluidAndMaterialSection control={form.control} />
            
            {/* 特殊要求区域 */}
            <SpecialRequirementsSection control={form.control} />
            
            {/* 联系邮箱区域 */}
            <ContactEmailSection control={form.control} />
            
            {/* 提交按钮 */}
            <div className="flex justify-center pt-6 sm:pt-8">
              <Button type="submit" disabled={isSubmitting} className="group relative bg-gradient-to-r from-blue-500/90 via-purple-500/90 to-pink-500/90 hover:from-blue-600/90 hover:via-purple-600/90 hover:to-pink-600/90 text-white font-bold py-3 sm:py-4 px-8 sm:px-12 rounded-xl sm:rounded-2xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl border border-white/40 backdrop-blur-lg text-base sm:text-lg w-full sm:w-auto">
                <span className="relative z-10 flex items-center gap-2 sm:gap-3 justify-center">
                  {isSubmitting ? <>
                      <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin drop-shadow-sm" />
                      提交中...
                    </> : <>
                      <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 drop-shadow-sm" />
                      提交参数
                      <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform duration-300 drop-shadow-sm" />
                    </>}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/30 to-transparent rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>;
}