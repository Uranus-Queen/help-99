// @ts-ignore;
import React from 'react';

/**
 * 动画背景组件
 * @returns {React.Element} 动画背景元素
 */
export function AnimatedBackground() {
  return <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-2xl opacity-40 animate-float-1"></div>
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-2xl opacity-40 animate-float-2"></div>
      <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-2xl opacity-40 animate-float-3"></div>
      <div className="absolute top-20 right-20 w-60 h-60 bg-yellow-200 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-float-4"></div>
      <div className="absolute bottom-32 left-1/3 w-64 h-64 bg-green-300 rounded-full mix-blend-multiply filter blur-xl opacity-35 animate-float-5"></div>
      <div className="absolute top-1/2 right-1/4 w-56 h-56 bg-red-300 rounded-full mix-blend-multiply filter blur-xl opacity-25 animate-float-6"></div>
      <div className="absolute bottom-20 left-1/4 w-48 h-48 bg-indigo-300 rounded-full mix-blend-multiply filter blur-lg opacity-30 animate-float-7"></div>
      <div className="absolute top-1/3 left-1/2 w-52 h-52 bg-teal-300 rounded-full mix-blend-multiply filter blur-lg opacity-28 animate-float-8"></div>
    </div>;
}

/**
 * 成功页面背景组件
 * @description 成功页面的简化背景动画
 * @returns {React.Element} 成功页面背景元素
 */
export function SuccessPageBackground() {
  return <div className="absolute inset-0">
      <div className="absolute top-20 left-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float-1"></div>
      <div className="absolute top-40 right-20 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float-2"></div>
      <div className="absolute -bottom-8 left-40 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float-3"></div>
      <div className="absolute top-60 left-1/2 w-64 h-64 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-float-4"></div>
      <div className="absolute bottom-20 right-1/3 w-56 h-56 bg-green-300 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-float-5"></div>
    </div>;
}