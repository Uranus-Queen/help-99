// @ts-ignore;
import React, { useState, useEffect, useCallback } from 'react';
// @ts-ignore;
import { Button, Form, useToast } from '@/components/ui';
// @ts-ignore;
import { Mail, Thermometer, Droplets, Wind, Zap, CheckCircle, Loader2, Settings, Gauge, Waves, Shield, Sparkles, ArrowRight, Building2, AlertCircle } from 'lucide-react';

import { useForm } from 'react-hook-form';
import { SimpleFormField } from '@/components/SecureFormField';
import { debounce, validators } from '@/lib/security';
import Header from '@/components/Header';
export default function HeatExchangerForm(props) {
  const {
    $w,
    style
  } = props;
  const {
    toast
  } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const heatExchangerTypes = [{
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
  const materials = [{
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
  useEffect(() => {
    setIsLoaded(true);
  }, []);
  const debouncedValidation = useCallback(debounce((fieldName, value) => {
    form.trigger(fieldName);
  }, 500), [form]);
  const onSubmit = async values => {
    setIsSubmitting(true);
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 这里可以调用实际的API
      // await $w.cloud.callDataSource({
      //   dataSourceName: 'heat_exchanger_requests',
      //   methodName: 'wedaCreateV2',
      //   params: { data: values }
      // });

      setIsSubmitted(true);
      toast({
        title: "提交成功！",
        description: "我们已收到您的换热器参数需求，将尽快与您联系。"
      });
    } catch (error) {
      toast({
        title: "提交失败",
        description: error.message || "请稍后重试",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  if (isSubmitted) {
    return <div style={style} className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float-1"></div>
          <div className="absolute top-40 right-20 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float-2"></div>
          <div className="absolute -bottom-8 left-40 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float-3"></div>
          <div className="absolute top-60 left-1/2 w-64 h-64 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-float-4"></div>
          <div className="absolute bottom-20 right-1/3 w-56 h-56 bg-green-300 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-float-5"></div>
        </div>
        
        <div className="relative z-10 w-full max-w-md">
          <div className="backdrop-blur-3xl bg-white/20 border border-white/40 shadow-2xl rounded-3xl overflow-hidden">
            <div className="bg-gradient-to-r from-green-400/90 to-emerald-500/90 p-6 text-center backdrop-blur-md">
              <div className="w-20 h-20 bg-white/30 backdrop-blur-lg rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse border border-white/40">
                <CheckCircle className="w-10 h-10 text-white drop-shadow-lg" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2 drop-shadow-md">提交成功！</h2>
            </div>
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
              
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600 backdrop-blur-sm bg-white/20 rounded-full px-3 py-1">
                  <Shield className="w-4 h-4 text-green-500" />
                  <span>您的信息已安全保存</span>
                </div>
                <Button onClick={() => {
                setIsSubmitted(false);
                form.reset();
              }} className="w-full bg-gradient-to-r from-blue-500/90 to-purple-600/90 hover:from-blue-600/90 hover:to-purple-700/90 text-white font-semibold py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-xl border border-white/30 backdrop-blur-md">
                  <Sparkles className="w-4 h-4 mr-2" />
                  提交新的需求
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>;
  }
  return <div style={style} className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
      <Header />
      
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-2xl opacity-40 animate-float-1"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-2xl opacity-40 animate-float-2"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-2xl opacity-40 animate-float-3"></div>
        <div className="absolute top-20 right-20 w-60 h-60 bg-yellow-200 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-float-4"></div>
        <div className="absolute bottom-32 left-1/3 w-64 h-64 bg-green-300 rounded-full mix-blend-multiply filter blur-xl opacity-35 animate-float-5"></div>
        <div className="absolute top-1/2 right-1/4 w-56 h-56 bg-red-300 rounded-full mix-blend-multiply filter blur-xl opacity-25 animate-float-6"></div>
        <div className="absolute bottom-20 left-1/4 w-48 h-48 bg-indigo-300 rounded-full mix-blend-multiply filter blur-lg opacity-30 animate-float-7"></div>
        <div className="absolute top-1/3 left-1/2 w-52 h-52 bg-teal-300 rounded-full mix-blend-multiply filter blur-lg opacity-28 animate-float-8"></div>
      </div>

      <div className={`relative z-10 max-w-6xl mx-auto transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} pt-24 sm:pt-28`}>
        <div className="text-center mb-6 sm:mb-8 pt-4 sm:pt-6 px-2">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500/90 via-purple-500/90 to-pink-500/90 rounded-2xl sm:rounded-3xl mb-4 sm:mb-6 shadow-2xl border border-white/40 backdrop-blur-2xl">
            <Thermometer className="w-8 h-8 sm:w-10 sm:h-10 text-white drop-shadow-lg" />
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-3 sm:mb-4 drop-shadow-sm">
            换热器参数配置
          </h1>
          <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto backdrop-blur-sm bg-white/20 rounded-lg p-3 border border-white/30">
            请填写您的换热器技术参数，我们将为您提供专业的定制化解决方案
          </p>
        </div>

        <div className="backdrop-blur-3xl bg-white/20 border border-white/40 shadow-2xl rounded-2xl sm:rounded-3xl overflow-hidden">
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
          
          <div className="p-4 sm:p-6 lg:p-8 backdrop-blur-md bg-white/10">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 sm:space-y-8">
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-red-500/90 to-orange-500/90 rounded-xl flex items-center justify-center shadow-lg border border-white/40 backdrop-blur-lg">
                      <Gauge className="w-4 h-4 sm:w-5 sm:h-5 text-white drop-shadow-md" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800 drop-shadow-sm">核心参数</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-4">
                      <SimpleFormField control={form.control} name="heatExchangerType" label="换热器类型 *" placeholder="选择类型" type="select" icon={Building2} options={heatExchangerTypes} validationRules={{
                      required: true
                    }} />

                      <SimpleFormField control={form.control} name="power" label="功率 (kW) *" placeholder="如: 100 或 50-200" icon={Zap} validationRules={{
                      required: true
                    }} />
                    </div>

                    <div className="space-y-4">
                      <SimpleFormField control={form.control} name="inletTemp" label="进口温度 (°C) *" placeholder="如: 80" icon={Thermometer} validationRules={{
                      required: true
                    }} />

                      <SimpleFormField control={form.control} name="outletTemp" label="出口温度 (°C) *" placeholder="如: 40" icon={Thermometer} validationRules={{
                      required: true
                    }} />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 sm:space-y-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-cyan-500/90 to-blue-500/90 rounded-xl flex items-center justify-center shadow-lg border border-white/40 backdrop-blur-lg">
                      <Waves className="w-4 h-4 sm:w-5 sm:h-5 text-white drop-shadow-md" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800 drop-shadow-sm">流体与材质</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-4">
                      <SimpleFormField control={form.control} name="flowRate" label="流量 (m³/h) *" placeholder="如: 50 或 20-100" icon={Wind} validationRules={{
                      required: true
                    }} />

                      <SimpleFormField control={form.control} name="pressure" label="压力 (MPa) *" placeholder="如: 2.0 或 1.0-3.0" icon={Droplets} validationRules={{
                      required: true
                    }} />
                    </div>

                    <div className="space-y-4">
                      <SimpleFormField control={form.control} name="material" label="材质要求 *" placeholder="选择材质" type="select" options={materials} validationRules={{
                      required: true
                    }} />

                      <SimpleFormField control={form.control} name="application" label="应用场景" placeholder="如: 化工、制冷、空调等" validationRules={{
                      maxLength: 100
                    }} />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-500/90 to-emerald-500/90 rounded-xl flex items-center justify-center shadow-lg border border-white/40 backdrop-blur-lg">
                      <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white drop-shadow-md" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800 drop-shadow-sm">特殊要求</h3>
                  </div>
                  
                  <div className="backdrop-blur-xl bg-white/30 rounded-xl p-4 border border-white/40 shadow-lg transition-all duration-300 hover:shadow-xl hover:bg-white/40">
                    <SimpleFormField control={form.control} name="additionalRequirements" label="附加要求" placeholder="请描述其他特殊要求或技术细节..." type="textarea" validationRules={{
                    maxLength: 500
                  }} />
                  </div>
                </div>

                <div className="backdrop-blur-xl bg-white/30 rounded-xl p-6 border border-white/40 shadow-lg transition-all duration-300 hover:shadow-xl hover:bg-white/40">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500/90 to-purple-600/90 rounded-xl flex items-center justify-center shadow-lg border border-white/40 backdrop-blur-lg">
                      <Mail className="w-5 h-5 text-white drop-shadow-md" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 drop-shadow-sm">联系邮箱 *</h3>
                  </div>
                  
                  <SimpleFormField control={form.control} name="email" placeholder="请输入您的邮箱地址" validationRules={{
                  required: true
                }} className="pl-10 pr-4 py-3 text-base" />
                </div>

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
        </div>

        <div className="text-center mt-6 sm:mt-10 text-gray-600">
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
          <p className="mt-3 sm:mt-4 text-xs text-gray-500 backdrop-blur-sm bg-white/20 rounded-full px-3 py-1 border border-white/30">
            我们承诺保护您的隐私信息，仅用于技术方案制定
          </p>
        </div>
      </div>

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
}