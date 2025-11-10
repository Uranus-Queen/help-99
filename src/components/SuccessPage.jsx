// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Button } from '@/components/ui';
// @ts-ignore;
import { CheckCircle, Mail, Shield, Sparkles } from 'lucide-react';

// @ts-ignore;
import { SuccessPageBackground } from '@/components/AnimatedBackground';

/**
 * 成功页面组件
 * @param {Object} props - 组件属性
 * @param {Function} props.onReset - 重置表单的回调函数
 * @returns {React.Element} 成功页面
 */
export function SuccessPage({
  onReset
}) {
  return <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* 背景动画 */}
      <SuccessPageBackground />
      
      {/* 成功提示卡片 */}
      <div className="relative z-10 w-full max-w-md">
        <div className="backdrop-blur-3xl bg-white/20 border border-white/40 shadow-2xl rounded-3xl overflow-hidden">
          {/* 头部区域 */}
          <div className="bg-gradient-to-r from-green-400/90 to-emerald-500/90 p-6 text-center backdrop-blur-md">
            <div className="w-20 h-20 bg-white/30 backdrop-blur-lg rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse border border-white/40">
              <CheckCircle className="w-10 h-10 text-white drop-shadow-lg" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2 drop-shadow-md">提交成功！</h2>
          </div>
          
          {/* 内容区域 */}
          <div className="p-8 text-center backdrop-blur-md bg-white/10">
            <div className="mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500/90 to-purple-600/90 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg border border-white/30">
                <Mail className="w-8 h-8 text-white drop-shadow-md" />
              </div>
              <p className="text-gray-700 text-lg leading-relaxed backdrop-blur-sm bg-white/20 rounded-lg p-3">
                我们已收到您的换热器参数需求<br />
                <span className="font-semibold text-blue-600 drop-shadow-sm">技术专家将在24小时内与您联系</span>
              </p>
            </div>
            
            {/* 操作区域 */}
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600 backdrop-blur-sm bg-white/20 rounded-full px-3 py-1">
                <Shield className="w-4 h-4 text-green-500" />
                <span>您的信息已安全保存</span>
              </div>
              <Button onClick={onReset} className="w-full bg-gradient-to-r from-blue-500/90 to-purple-600/90 hover:from-blue-600/90 hover:to-purple-700/90 text-white font-semibold py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-xl border border-white/30 backdrop-blur-md">
                <Sparkles className="w-4 h-4 mr-2" />
                提交新的需求
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>;
}