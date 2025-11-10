// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button } from '@/components/ui';
// @ts-ignore;
import { Menu, X, Thermometer, Phone, Mail, ChevronDown } from 'lucide-react';

/**
 * 页面头部导航组件
 * @description 提供响应式导航菜单和品牌展示
 */
export function Header() {
  // 状态管理
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // 导航菜单配置
  const navItems = [{
    name: '首页',
    href: '#home'
  }, {
    name: '产品服务',
    href: '#products',
    dropdown: [{
      name: '换热器系列',
      href: '#heat-exchangers'
    }, {
      name: '定制解决方案',
      href: '#solutions'
    }, {
      name: '技术参数配置',
      href: '#config'
    }]
  }, {
    name: '技术支持',
    href: '#support'
  }, {
    name: '案例展示',
    href: '#cases'
  }, {
    name: '关于我们',
    href: '#about'
  }, {
    name: '联系方式',
    href: '#contact'
  }];

  /**
   * 监听滚动事件
   * @description 根据页面滚动位置改变header样式
   */
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /**
   * 渲染桌面端导航菜单
   * @returns {React.Element} 桌面端导航菜单
   */
  const renderDesktopNav = () => <nav className="hidden lg:flex items-center space-x-8">
      {navItems.map(item => <div key={item.name} className="relative">
          {item.dropdown ? <div className="relative">
              <button onMouseEnter={() => setIsDropdownOpen(true)} onMouseLeave={() => setIsDropdownOpen(false)} className="flex items-center gap-1 text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 py-2">
                {item.name}
                <ChevronDown className="w-4 h-4" />
              </button>
              
              {/* 下拉菜单 */}
              {isDropdownOpen && <div onMouseEnter={() => setIsDropdownOpen(true)} onMouseLeave={() => setIsDropdownOpen(false)} className="absolute top-full left-0 mt-2 w-56 backdrop-blur-xl bg-white/90 border border-white/40 rounded-xl shadow-xl overflow-hidden">
                  {item.dropdown.map(dropdownItem => <a key={dropdownItem.name} href={dropdownItem.href} className="block px-4 py-3 text-sm text-gray-700 hover:bg-blue-50/50 hover:text-blue-600 transition-colors duration-200">
                      {dropdownItem.name}
                    </a>)}
                </div>}
            </div> : <a href={item.href} className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 py-2">
              {item.name}
            </a>}
        </div>)}
    </nav>;

  /**
   * 渲染移动端导航菜单
   * @returns {React.Element} 移动端导航菜单
   */
  const renderMobileNav = () => <div className="lg:hidden border-t border-white/20 backdrop-blur-xl bg-white/10">
      <nav className="px-4 py-6 space-y-4">
        {navItems.map(item => <div key={item.name}>
            {item.dropdown ? <div>
                <button className="flex items-center justify-between w-full text-left text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 py-2">
                  {item.name}
                  <ChevronDown className="w-4 h-4" />
                </button>
                <div className="ml-4 mt-2 space-y-2">
                  {item.dropdown.map(dropdownItem => <a key={dropdownItem.name} href={dropdownItem.href} className="block text-sm text-gray-600 hover:text-blue-600 transition-colors duration-200 py-1">
                      {dropdownItem.name}
                    </a>)}
                </div>
              </div> : <a href={item.href} className="block text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 py-2">
                {item.name}
              </a>}
          </div>)}
        
        {/* 移动端联系信息 */}
        <div className="pt-4 border-t border-white/20 space-y-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Phone className="w-4 h-4" />
            <span>400-888-8888</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Mail className="w-4 h-4" />
            <span>contact@heatex.com</span>
          </div>
          <Button className="w-full bg-gradient-to-r from-blue-500/90 via-purple-500/90 to-pink-500/90 hover:from-blue-600/90 hover:via-purple-600/90 hover:to-pink-600/90 text-white font-semibold py-3 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg border border-white/40 backdrop-blur-lg">
            免费咨询
          </Button>
        </div>
      </nav>
    </div>;
  return <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'backdrop-blur-xl bg-white/20 border-b border-white/30 shadow-lg' : 'backdrop-blur-lg bg-white/10 border-b border-white/20'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo区域 */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500/90 via-purple-500/90 to-pink-500/90 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg border border-white/40 backdrop-blur-lg">
              <Thermometer className="w-5 h-5 sm:w-6 sm:h-6 text-white drop-shadow-md" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                换热器专家
              </h1>
              <p className="text-xs text-gray-600">专业热交换解决方案</p>
            </div>
            <div className="sm:hidden">
              <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                换热器专家
              </h1>
            </div>
          </div>

          {/* 桌面端导航菜单 */}
          {renderDesktopNav()}

          {/* 右侧操作区域 */}
          <div className="flex items-center gap-3">
            {/* 桌面端联系信息 */}
            <div className="hidden sm:flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="w-4 h-4" />
                <span className="hidden md:inline">400-888-8888</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="w-4 h-4" />
                <span className="hidden md:inline">contact@heatex.com</span>
              </div>
            </div>

            {/* CTA按钮 */}
            <Button className="hidden sm:block bg-gradient-to-r from-blue-500/90 via-purple-500/90 to-pink-500/90 hover:from-blue-600/90 hover:via-purple-600/90 hover:to-pink-600/90 text-white font-semibold px-6 py-2 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg border border-white/40 backdrop-blur-lg">
              免费咨询
            </Button>

            {/* 移动端菜单按钮 */}
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="lg:hidden p-2 rounded-lg text-gray-700 hover:bg-white/20 transition-colors duration-200">
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* 移动端菜单 */}
        {isMobileMenuOpen && renderMobileNav()}
      </div>
    </header>;
}
export default Header;