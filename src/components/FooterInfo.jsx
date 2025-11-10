// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Shield, Zap, CheckCircle } from 'lucide-react';

/**
 * 页面底部信息组件
 * @returns {React.Element} 底部信息区域
 */
export function FooterInfo() {
  return <div className="text-center mt-6 sm:mt-10 text-gray-600">
      {/* 服务保障标签 */}
      <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm">
        <div className="flex items-center gap-1 sm:gap-2 backdrop-blur-sm bg-white/30 rounded-full px-3 py-1 border border-white/30">
          <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 drop-shadow-sm" />
          <span>隐私保护</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-2 backdrop-blur-sm bg-white/30 rounded-full px-3 py-1 border border-white/30">
          <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500 drop-shadow-sm" />
          <span>快速响应</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-2 backdrop-blur-sm bg-white/30 rounded-full px-3 py-1 border border-white/30">
          <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500 drop-shadow-sm" />
          <span>专业服务</span>
        </div>
      </div>
      
      {/* 隐私声明 */}
      <p className="mt-3 sm:mt-4 text-xs text-gray-500 backdrop-blur-sm bg-white/20 rounded-full px-3 py-1 border border-white/30">
        我们承诺保护您的隐私信息，仅用于技术方案制定
      </p>
    </div>;
}