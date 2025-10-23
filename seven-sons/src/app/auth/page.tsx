'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LoginForm } from '@/components/auth/LoginForm'
import { SignUpForm } from '@/components/auth/SignUpForm'
import { useAuth } from '@/contexts/AuthContext'

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const { user, loading } = useAuth()
  const router = useRouter()

  // 如果用户已登录，重定向到首页
  useEffect(() => {
    if (!loading && user) {
      router.push('/')
    }
  }, [user, loading, router])

  // 如果正在加载或用户已登录，显示加载状态
  if (loading || user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">正在加载...</p>
        </div>
      </div>
    )
  }

  const handleSwitchToSignUp = () => {
    setIsLogin(false)
  }

  const handleSwitchToLogin = () => {
    setIsLogin(true)
  }

  const handleSignUpSuccess = () => {
    // 注册成功后切换到登录页面
    setTimeout(() => {
      setIsLogin(true)
    }, 2000)
  }

  return (
    <div className="relative">
      {/* 页面标题区域 */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center space-x-2 mb-4">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">7</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">七个儿子</h1>
        </div>
        <p className="text-gray-600">智能AI助手平台</p>
      </div>

      {/* 切换标签 */}
      <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
        <button
          onClick={() => setIsLogin(true)}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
            isLogin
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          登录
        </button>
        <button
          onClick={() => setIsLogin(false)}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
            !isLogin
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          注册
        </button>
      </div>

      {/* 表单内容 */}
      <div className="relative">
        <div className={`transition-all duration-300 ${isLogin ? 'opacity-100' : 'opacity-0 absolute inset-0 pointer-events-none'}`}>
          {isLogin && (
            <LoginForm onSwitchToSignUp={handleSwitchToSignUp} />
          )}
        </div>
        
        <div className={`transition-all duration-300 ${!isLogin ? 'opacity-100' : 'opacity-0 absolute inset-0 pointer-events-none'}`}>
          {!isLogin && (
            <SignUpForm 
              onSwitchToLogin={handleSwitchToLogin}
              onSuccess={handleSignUpSuccess}
            />
          )}
        </div>
      </div>

      {/* 底部信息 */}
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>继续使用即表示您同意我们的</p>
        <div className="space-x-4 mt-1">
          <button className="hover:text-gray-700 underline">服务条款</button>
          <span>·</span>
          <button className="hover:text-gray-700 underline">隐私政策</button>
        </div>
      </div>

      {/* 演示模式提示 - 只有在真正未配置时才显示 */}
      {(!process.env.NEXT_PUBLIC_SUPABASE_URL || 
        process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-project-id') ||
        process.env.NEXT_PUBLIC_SUPABASE_URL.includes('localhost') ||
        process.env.NEXT_PUBLIC_SUPABASE_URL === 'your_supabase_url_here') && (
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-medium text-yellow-800">演示模式</h3>
              <p className="text-sm text-yellow-700 mt-1">
                当前运行在演示模式下。要启用真实的用户认证，请配置 Supabase 环境变量。
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}