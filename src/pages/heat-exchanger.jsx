// @ts-ignore;
import React, { useState, useEffect, useCallback } from 'react';
// @ts-ignore;
import { Button, Form, useToast } from '@/components/ui';
// @ts-ignore;
import { Mail, Thermometer, CheckCircle, Loader2, Settings, Shield, Sparkles, ArrowRight, AlertCircle } from 'lucide-react';

// 表单相关导入
import { useForm } from 'react-hook-form';
import { debounce } from '@/lib/security';

// 组件导入
import Header from '@/components/Header';
import { CoreParametersSection, FluidAndMaterialSection, SpecialRequirementsSection, ContactSection, HEAT_EXCHANGER_TYPES, MATERIALS } from '@/components/FormSections';

// ==================== 常量定义 ====================

/**
 * 页面状态枚举
 */
const PAGE_STATES = {
  FORM: 'form',
  SUBMITTING: 'submitting',
  SUCCESS: 'success'
};

/**
 * 动画持续时间（毫秒）
 */
const ANIMATION_DURATION = 1000;

/**
 * 模拟API延迟时间（毫秒）
 */
const API_DELAY = 2000;

// ==================== 主组件 ====================

/**
 * 换热器参数配置表单组件
 * @param {Object} props - 组件属性
 * @param {Object} props.$w - 微信云开发对象
 * @param {Object} props.style - 自定义样式
 * @returns {JSX.Element} 表单组件
 */

// ==================== 样式定义 ====================

/**
 * 动画关键帧样式
 */
const animationStyles = `
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
`;

// 将样式注入到页面中
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = animationStyles;
  document.head.appendChild(styleElement);
}
export default function HeatExchangerForm(props) {
  const {
    $w,
    style
  } = props;
  const {
    toast
  } = useToast();

  // ==================== 状态管理 ====================

  /**
   * 页面加载状态
   */
  const [isLoaded, setIsLoaded] = useState(false);

  /**
   * 当前页面状态
   */
  const [pageState, setPageState] = useState(PAGE_STATES.FORM);

  /**
   * 表单实例
   */
  const form = useForm({
    defaultValues: {
      heatExchangerType: '',
      power: '',
      inletTemp: '',
      outletTemp: '',
      flowRate: '',
      pressure: '',
      material: '',
      application: '',
      additionalRequirements: '',
      email: ''
    }
  });

  // ==================== 生命周期 ====================

  /**
   * 组件挂载时的初始化
   */
  useEffect(() => {
    // 延迟显示页面，实现淡入效果
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // ==================== 事件处理函数 ====================

  /**
   * 防抖验证函数
   */
  const debouncedValidation = useCallback(debounce((fieldName, value) => {
    form.trigger(fieldName);
  }, 500), [form]);

  /**
   * 表单提交处理函数
   * @param {Object} values - 表单数据
   */
  const handleFormSubmit = async values => {
    // 设置提交状态
    setPageState(PAGE_STATES.SUBMITTING);
    try {
      // 模拟API调用
      await simulateApiCall();

      // 这里可以调用实际的API
      // await $w.cloud.callDataSource({
      //   dataSourceName: 'heat_exchanger_requests',
      //   methodName: 'wedaCreateV2',
      //   params: { data: values }
      // });

      // 提交成功，显示成功页面
      setPageState(PAGE_STATES.SUCCESS);
      showSuccessToast();
    } catch (error) {
      // 提交失败，显示错误信息
      showErrorToast(error);
      setPageState(PAGE_STATES.FORM);
    }
  };

  /**
   * 模拟API调用
   * @returns {Promise} Promise对象
   */
  const simulateApiCall = () => {
    return new Promise(resolve => setTimeout(resolve, API_DELAY));
  };

  /**
   * 显示成功提示
   */
  const showSuccessToast = () => {
    toast({
      title: "提交成功！",
      description: "我们已收到您的换热器参数需求，将尽快与您联系。"
    });
  };

  /**
   * 显示错误提示
   * @param {Error} error - 错误对象
   */
  const showErrorToast = error => {
    toast({
      title: "提交失败",
      description: error.message || "请稍后重试",
      variant: "destructive"
    });
  };

  /**
   * 重置表单并返回表单页面
   */
  const handleResetForm = () => {
    setPageState(PAGE_STATES.FORM);
    form.reset();
  };

  // ==================== 渲染函数 ====================

  /**
   * 渲染成功页面
   * @returns {JSX.Element} 成功页面组件
   */
  const renderSuccessPage = () => {
    return <div style={style} className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 flex items-center justify-center p-4 relative overflow-hidden">
        {/* 背景动画元素 */}
        <BackgroundAnimation />
        
        {/* 成功页面内容 */}
        <div className="relative z-10 w-full max-w-md">
          <div className="backdrop-blur-3xl bg-white/20 border border-white/40 shadow-2xl rounded-3xl overflow-hidden">
            {/* 成功页面头部 */}
            <div className="bg-gradient-to-r from-green-400/90 to-emerald-500/90 p-6 text-center backdrop-blur-md">
              <div className="w-20 h-20 bg-white/30 backdrop-blur-lg rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse border border-white/40">
                <CheckCircle className="w-10 h-10 text-white drop-shadow-lg" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2 drop-shadow-md">提交成功！</h2>
            </div>
            
            {/* 成功页面内容 */}
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
              
              {/* 操作按钮 */}
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600 backdrop-blur-sm bg-white/20 rounded-full px-3 py-1">
                  <Shield className="w-4 h-4 text-green-500" />
                  <span>您的信息已安全保存</span>
                </div>
                <Button onClick={handleResetForm} className="w-full bg-gradient-to-r from-blue-500/90 to-purple-600/90 hover:from-blue-600/90 hover:to-purple-700/90 text-white font-semibold py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-xl border border-white/30 backdrop-blur-md">
                  <Sparkles className="w-4 h-4 mr-2" />
                  提交新的需求
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>;
  };

  /**
   * 渲染表单页面
   * @returns {JSX.Element} 表单页面组件
   */
  const renderFormPage = () => {
    const isSubmitting = pageState === PAGE_STATES.SUBMITTING;
    return <div style={style} className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
        {/* 页面头部 */}
        <Header />
        
        {/* 背景动画元素 */}
        <BackgroundAnimation />
        
        {/* 主要内容区域 */}
        <div className={`relative z-10 max-w-6xl mx-auto transition-all duration-${ANIMATION_DURATION} ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} pt-24 sm:pt-28`}>
          {/* 页面标题区域 */}
          <PageHeader />
          
          {/* 表单容器 */}
          <FormContainer>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6 sm:space-y-8">
                {/* 核心参数区块 */}
                <CoreParametersSection control={form.control} />
                
                {/* 流体与材质区块 */}
                <FluidAndMaterialSection control={form.control} />
                
                {/* 特殊要求区块 */}
                <SpecialRequirementsSection control={form.control} />
                
                {/* 联系信息区块 */}
                <ContactSection control={form.control} />
                
                {/* 提交按钮 */}
                <SubmitButton isSubmitting={isSubmitting} />
              </form>
            </Form>
          </FormContainer>
          
          {/* 页面底部信息 */}
          <PageFooter />
        </div>
      </div>;
  };

  // ==================== 子组件 ====================

  /**
   * 背景动画组件
   * @returns {JSX.Element} 背景动画元素
   */
  const BackgroundAnimation = () => <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-2xl opacity-40 animate-float-1"></div>
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-2xl opacity-40 animate-float-2"></div>
      <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-2xl opacity-40 animate-float-3"></div>
      <div className="absolute top-20 right-20 w-60 h-60 bg-yellow-200 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-float-4"></div>
      <div className="absolute bottom-32 left-1/3 w-64 h-64 bg-green-300 rounded-full mix-blend-multiply filter blur-xl opacity-35 animate-float-5"></div>
      <div className="absolute top-1/2 right-1/4 w-56 h-56 bg-red-300 rounded-full mix-blend-multiply filter blur-xl opacity-25 animate-float-6"></div>
      <div className="absolute bottom-20 left-1/4 w-48 h-48 bg-indigo-300 rounded-full mix-blend-multiply filter blur-lg opacity-30 animate-float-7"></div>
      <div className="absolute top-1/3 left-1/2 w-52 h-52 bg-teal-300 rounded-full mix-blend-multiply filter blur-lg opacity-28 animate-float-8"></div>
    </div>;

  /**
   * 页面头部组件
   * @returns {JSX.Element} 页面头部
   */
  const PageHeader = () => <div className="text-center mb-6 sm:mb-8 pt-4 sm:pt-6 px-2">
      <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500/90 via-purple-500/90 to-pink-500/90 rounded-2xl sm:rounded-3xl mb-4 sm:mb-6 shadow-2xl border border-white/40 backdrop-blur-2xl">
        <Thermometer className="w-8 h-8 sm:w-10 sm:h-10 text-white drop-shadow-lg" />
      </div>
      <h1 className="text-3xl sm:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-3 sm:mb-4 drop-shadow-sm">
        换热器参数配置
      </h1>
      <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto backdrop-blur-sm bg-white/20 rounded-lg p-3 border border-white/30">
        请填写您的换热器技术参数，我们将为您提供专业的定制化解决方案
      </p>
    </div>;

  /**
   * 表单容器组件
   * @param {Object} props - 组件属性
   * @param {React.ReactNode} props.children - 子组件
   * @returns {JSX.Element} 表单容器
   */
  const FormContainer = ({
    children
  }) => <div className="backdrop-blur-3xl bg-white/20 border border-white/40 shadow-2xl rounded-2xl sm:rounded-3xl overflow-hidden">
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
        {children}
      </div>
    </div>;

  /**
   * 提交按钮组件
   * @param {Object} props - 组件属性
   * @param {boolean} props.isSubmitting - 是否正在提交
   * @returns {JSX.Element} 提交按钮
   */
  const SubmitButton = ({
    isSubmitting
  }) => <div className="flex justify-center pt-6 sm:pt-8">
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
    </div>;

  /**
   * 页面底部组件
   * @returns {JSX.Element} 页面底部
   */
  const PageFooter = () => <div className="text-center mt-6 sm:mt-10 text-gray-600">
      <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm">
        <div className="flex items-center gap-1 sm:gap-2 backdrop-blur-sm bg-white/30 rounded-full px-3 py-1 border border-white/30">
          <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 drop-shadow-sm" />
          <span>隐私保护</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-2 backdrop-blur-sm bg-white/30 rounded-full px-3 py-1 border border-white/30">
          <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500 drop-shadow-sm" />
          <span>快速响应</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-2 backdrop-blur-sm bg-white/30 rounded-full px-3 py-1 border border-white/30">
          <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500 drop-shadow-sm" />
          <span>专业服务</span>
        </div>
      </div>
      <p className="mt-3 sm:mt-4 text-xs text-gray-500 backdrop-blur-sm bg-white/20 rounded-full px-3 py-1 border border-white/30">
        我们承诺保护您的隐私信息，仅用于技术方案制定
      </p>
    </div>;

  // ==================== 主渲染 ====================

  // 根据页面状态渲染不同内容
  return pageState === PAGE_STATES.SUCCESS ? renderSuccessPage() : renderFormPage();
}