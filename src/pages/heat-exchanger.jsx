// @ts-ignore;
import React, { useState, useEffect, useCallback } from 'react';
// @ts-ignore;
import { useToast } from '@/components/ui';

// 导入自定义组件和工具
import { useForm } from 'react-hook-form';
import { debounce } from '@/lib/security';
import { DEFAULT_FORM_VALUES, ANIMATION_CONFIG, UI_CONFIG } from '@/constants/formConfig';

// 导入页面组件
import Header from '@/components/Header';
import { AnimatedBackground } from '@/components/AnimatedBackground';
import { FormHeader } from '@/components/FormHeader';
import { FormContainer } from '@/components/FormContainer';
import { SuccessPage } from '@/components/SuccessPage';
import { FooterInfo } from '@/components/FooterInfo';

/**
 * 换热器参数配置表单页面
 * @description 提供热交换器技术参数配置功能
 * @param {Object} props - 组件属性
 * @param {Object} props.$w - 微信云开发对象
 * @param {Object} props.style - 自定义样式
 */
export default function HeatExchangerForm(props) {
  const {
    $w,
    style
  } = props;
  const {
    toast
  } = useToast();

  // 状态管理
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // React Hook Form配置
  const form = useForm({
    defaultValues: DEFAULT_FORM_VALUES
  });

  /**
   * 页面加载完成后的初始化
   */
  useEffect(() => {
    // 延迟加载动画效果
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, UI_CONFIG.DELAYS.PAGE_LOAD);
    return () => clearTimeout(timer);
  }, []);

  /**
   * 防抖验证函数
   * @description 延迟执行表单字段验证
   */
  const debouncedValidation = useCallback(debounce((fieldName, value) => {
    form.trigger(fieldName);
  }, UI_CONFIG.DELAYS.DEBOUNCE), [form]);

  /**
   * 表单提交处理函数
   * @description 处理表单提交逻辑
   * @param {Object} values - 表单数据
   */
  const onSubmit = async values => {
    setIsSubmitting(true);
    try {
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, UI_CONFIG.DELAYS.SUBMIT_SIMULATION));

      // TODO: 实际的API调用
      // await $w.cloud.callDataSource({
      //   dataSourceName: 'heat_exchanger_requests',
      //   methodName: 'wedaCreateV2',
      //   params: { data: values }
      // });

      // 提交成功处理
      setIsSubmitted(true);
      toast({
        title: "提交成功！",
        description: "我们已收到您的换热器参数需求，将尽快与您联系。"
      });
    } catch (error) {
      // 错误处理
      toast({
        title: "提交失败",
        description: error.message || "请稍后重试",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * 重置表单处理函数
   * @description 重置表单状态并返回表单页面
   */
  const handleReset = () => {
    setIsSubmitted(false);
    form.reset();
  };

  /**
   * 渲染表单页面
   * @returns {React.Element} 表单页面
   */
  const renderFormPage = () => <div style={style} className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
      <Header />
      
      {/* 背景动画 */}
      <AnimatedBackground />

      {/* 主要内容区域 */}
      <div className={`relative z-10 max-w-6xl mx-auto transition-all duration-${ANIMATION_CONFIG.DURATION.SLOW} ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} pt-24 sm:pt-28`}>
        {/* 表单头部 */}
        <FormHeader />
        
        {/* 表单容器 */}
        <FormContainer form={form} onSubmit={onSubmit} isSubmitting={isSubmitting} />
        
        {/* 底部信息 */}
        <FooterInfo />
      </div>

      {/* 动画样式 */}
      <style jsx>{`
        @keyframes float-1 {
          0%, 100% { transform: translate(0px, 0px) scale(1) rotate(0deg); }
          25% { transform: translate(30px, -50px) scale(1.1) rotate(90deg); }
          50% { transform: translate(-20px, 30px) scale(0.9) rotate(180deg); }
          75% { transform: translate(40px, 20px) scale(1.05) rotate(270deg); }
        }
        
        @keyframes float-2 {
          0%, 100% { transform: translate(0px, 0px) scale(1) rotate(0deg); }
          20% { transform: translate(-40px, 30px) scale(1.2) rotate(-72deg); }
          40% { transform: translate(50px, -30px) scale(0.8) rotate(-144deg); }
          60% { transform: translate(-30px, -40px) scale(1.1) rotate(-216deg); }
          80% { transform: translate(20px, 40px) scale(0.95) rotate(-288deg); }
        }
        
        @keyframes float-3 {
          0%, 100% { transform: translate(0px, 0px) scale(1) rotate(0deg); }
          33% { transform: translate(40px, -60px) scale(1.15) rotate(120deg); }
          66% { transform: translate(-60px, 40px) scale(0.85) rotate(240deg); }
        }
        
        @keyframes float-4 {
          0%, 100% { transform: translate(0px, 0px) scale(1) rotate(0deg); }
          25% { transform: translate(-50px, -20px) scale(1.08) rotate(-90deg); }
          50% { transform: translate(30px, 50px) scale(0.92) rotate(-180deg); }
          75% { transform: translate(20px, -30px) scale(1.04) rotate(-270deg); }
        }
        
        @keyframes float-5 {
          0%, 100% { transform: translate(0px, 0px) scale(1) rotate(0deg); }
          20% { transform: translate(60px, 20px) scale(1.12) rotate(72deg); }
          40% { transform: translate(-40px, -50px) scale(0.88) rotate(144deg); }
          60% { transform: translate(-20px, 60px) scale(1.06) rotate(216deg); }
          80% { transform: translate(50px, -40px) scale(0.94) rotate(288deg); }
        }
        
        @keyframes float-6 {
          0%, 100% { transform: translate(0px, 0px) scale(1) rotate(0deg); }
          30% { transform: translate(-35px, 45px) scale(1.18) rotate(-108deg); }
          60% { transform: translate(45px, -35px) scale(0.82) rotate(-216deg); }
        }
        
        @keyframes float-7 {
          0%, 100% { transform: translate(0px, 0px) scale(1) rotate(0deg); }
          50% { transform: translate(-25px, -55px) scale(1.25) rotate(180deg); }
        }
        
        @keyframes float-8 {
          0%, 100% { transform: translate(0px, 0px) scale(1) rotate(0deg); }
          25% { transform: translate(55px, 35px) scale(0.9) rotate(90deg); }
          50% { transform: translate(-45px, -25px) scale(1.1) rotate(180deg); }
          75% { transform: translate(15px, -45px) scale(0.95) rotate(270deg); }
        }
        
        .animate-float-1 { animation: float-1 8s ease-in-out infinite; }
        .animate-float-2 { animation: float-2 10s ease-in-out infinite; }
        .animate-float-3 { animation: float-3 7s ease-in-out infinite; }
        .animate-float-4 { animation: float-4 9s ease-in-out infinite; }
        .animate-float-5 { animation: float-5 12s ease-in-out infinite; }
        .animate-float-6 { animation: float-6 11s ease-in-out infinite; }
        .animate-float-7 { animation: float-7 6s ease-in-out infinite; }
        .animate-float-8 { animation: float-8 9.5s ease-in-out infinite; }
      `}</style>
    </div>;

  // 根据提交状态渲染不同页面
  return isSubmitted ? <SuccessPage onReset={handleReset} /> : renderFormPage();
}