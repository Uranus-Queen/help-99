// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Thermometer } from 'lucide-react';

/**
 * 表单头部组件
 * @returns {React.Element} 表单头部区域
 */
export function FormHeader() {
  return <div className="text-center mb-6 sm:mb-8 pt-4 sm:pt-6 px-2">
      {/* 图标 */}
      <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500/90 via-purple-500/90 to-pink-500/90 rounded-2xl sm:rounded-3xl mb-4 sm:mb-6 shadow-2xl border border-white/40 backdrop-blur-2xl">
        <Thermometer className="w-8 h-8 sm:w-10 sm:h-10 text-white drop-shadow-lg" />
      </div>
      
      {/* 标题 */}
      <h1 className="text-3xl sm:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-3 sm:mb-4 drop-shadow-sm">
        换热器参数配置
      </h1>
      
      {/* 描述 */}
      <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto backdrop-blur-sm bg-white/20 rounded-lg p-3 border border-white/30">
        请填写您的换热器技术参数，我们将为您提供专业的定制化解决方案
      </p>
    </div>;
}