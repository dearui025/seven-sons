'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from "next/image"
import { DEFAULT_AI_ROLES, type AIRole } from '@/types/ai-roles'
import { MessageCircle, Sparkles, Users, Settings, LogIn, User, LogOut, MessageSquare } from 'lucide-react'
import { setupDatabase, getAllAIRoles } from '@/lib/database-setup'
import { useAuth } from '@/contexts/AuthContext'
import { DEMO_MODE } from '@/lib/supabase'

export default function Home() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [selectedRole, setSelectedRole] = useState<AIRole | null>(null)
  const [aiRoles, setAiRoles] = useState<AIRole[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [dbStatus, setDbStatus] = useState<'ready' | 'error' | 'checking'>('checking')

  useEffect(() => {
    initializeApp()
  }, [])

  const initializeApp = async () => {
    try {
      setIsLoading(true)
      setDbStatus('checking')
      
      // 直接获取AI角色（getAllAIRoles内部会处理DEMO_MODE）
      const roles = await getAllAIRoles()
      setAiRoles(roles)
      setDbStatus('ready')
      
    } catch (error) {
      console.error('应用初始化失败:', error)
      setDbStatus('error')
      // 确保即使出错也显示默认角色
      setAiRoles(DEFAULT_AI_ROLES)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogin = () => {
    router.push('/auth')
  }

  const handleLogout = async () => {
    await signOut()
  }

  const handleStartChat = async (roleName: string) => {
    try {
      console.log('🚀 开始聊天导航:', roleName)
      
      // 确保角色名称有效
      if (!roleName || roleName.trim() === '') {
        console.error('❌ 角色名称无效')
        return
      }
      
      // 编码角色名称，处理特殊字符
      const encodedRoleName = encodeURIComponent(roleName.trim())
      const chatUrl = `/chat?roleName=${encodedRoleName}`
      
      console.log('🔗 导航到:', chatUrl)
      
      // 使用 router.push 进行导航，添加错误处理
      await router.push(chatUrl)
      
    } catch (error) {
      console.error('💥 聊天导航失败:', error)
      
      // 如果导航失败，尝试重新加载页面
      const errorMessage = error instanceof Error ? error.message : String(error)
      if (errorMessage.includes('ERR_ABORTED') || 
          errorMessage.includes('Failed to fetch') ||
          errorMessage.includes('RSC')) {
        console.log('🔄 检测到RSC错误，尝试直接跳转')
        
        // 使用 window.location 作为备用方案
        try {
          const encodedRoleName = encodeURIComponent(roleName.trim())
          window.location.href = `/chat?roleName=${encodedRoleName}`
        } catch (fallbackError) {
          console.error('💥 备用导航也失败:', fallbackError)
        }
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      {/* 头部导航 */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
              <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                7个儿子
              </h1>
              {/* 数据库状态指示器 - 手机端隐藏 */}
              <div className="hidden sm:flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  dbStatus === 'ready' ? 'bg-green-500' : 
                  dbStatus === 'error' ? 'bg-red-500' : 'bg-yellow-500'
                }`}></div>
                <span className="text-xs text-gray-400">
                  {dbStatus === 'ready' ? '数据库就绪' : 
                   dbStatus === 'error' ? '离线模式' : '连接中...'}
                </span>
              </div>
            </div>
            <nav className="flex items-center space-x-2 sm:space-x-6">
              {/* 移动端简化导航 */}
              <button
                onClick={() => router.push('/group-chat')}
                className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1.5 sm:py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                <span className="text-sm sm:text-base">群聊</span>
              </button>
              
              {/* 用户认证区域 */}
              {user ? (
                <div className="flex items-center space-x-2 sm:space-x-4">
                  <div className="hidden sm:flex items-center space-x-2">
                    <User className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-700">{user.email}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <LogOut className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>退出</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleLogin}
                  className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 text-sm sm:text-base"
                >
                  <LogIn className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>登录</span>
                </button>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* 主要内容 */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-12">
        {/* 欢迎区域 */}
        <div className="text-center mb-8 sm:mb-16">
          <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 px-2">
            欢迎来到AI角色互动平台
          </h2>
          <p className="text-base sm:text-xl text-gray-600 max-w-3xl mx-auto px-4">
            与七位独特的AI角色对话，每个角色都有自己的个性、专长和学习能力。
            他们会根据与您的互动不断学习和成长。
          </p>
        </div>

        {DEMO_MODE && (
          <div className="mb-6 p-3 bg-yellow-50 border border-yellow-300 text-yellow-800 rounded">
            当前处于 DEMO 模式或数据库不可用，已回退到内置角色（DEFAULT_AI_ROLES）。部分数据可能不会持久化到 Supabase。
          </div>
        )}

        {/* 加载状态 */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <p className="mt-4 text-gray-600">正在初始化应用...</p>
          </div>
        )}

        {/* AI角色网格 */}
        {!isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
          {aiRoles.map((role, index) => (
            <div
              key={index}
              className={`bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 ${
                selectedRole?.name === role.name ? 'ring-2 ring-purple-500 ring-offset-2' : ''
              }`}
              onClick={() => setSelectedRole(selectedRole?.name === role.name ? null : role)}
            >
              <div className="p-4 sm:p-6">
                {/* 头像 */}
                <div className="flex justify-center mb-3 sm:mb-4">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden bg-gray-100">
                    <Image
                      src={role.avatar_url}
                      alt={role.name}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* 角色信息 */}
                <div className="text-center">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">{role.name}</h3>
                  <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">{role.description}</p>
                  
                  {/* 专长标签 */}
                  <div className="flex flex-wrap gap-1 justify-center mb-4">
                    {role.specialties.slice(0, 2).map((specialty, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>

                  {/* 学习进度 */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>学习进度</span>
                      <span>Lv.{role.learning_progress.level}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(role.learning_progress.experience % 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* 开始对话按钮 */}
                  <button
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 flex items-center justify-center space-x-1 sm:space-x-2 text-sm sm:text-base"
                    onClick={() => handleStartChat(role.name)}
                  >
                    <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span>开始对话</span>
                  </button>
                </div>
              </div>

              {/* 展开的详细信息 */}
              {selectedRole?.name === role.name && (
                <div className="border-t border-gray-100 p-6 bg-gray-50 rounded-b-2xl">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">个性特点</h4>
                      <p className="text-gray-600 text-sm">{role.personality}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">专业领域</h4>
                      <div className="flex flex-wrap gap-1">
                        {role.specialties.map((specialty, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                          >
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">对话风格</h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>语调: {role.settings.tone}</span>
                        <span>创造力: {role.settings.creativity}%</span>
                        <span>详细度: {role.settings.verbosity}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        )}

        {/* 群聊功能入口 */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-8 mb-8 sm:mb-12 text-white text-center">
          <div className="max-w-2xl mx-auto">
            <MessageSquare className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4" />
            <h3 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">AI角色群聊</h3>
            <p className="text-sm sm:text-lg mb-4 sm:mb-6 opacity-90">
              让所有AI角色在同一个群聊中互动，体验多角色协作的魅力！
            </p>
            <button
              onClick={() => router.push('/group-chat')}
              className="bg-white text-purple-600 px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center space-x-2 text-sm sm:text-base"
            >
              <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>进入群聊</span>
            </button>
          </div>
        </div>

        {/* 功能特色 */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-8">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 text-center">平台特色</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
              </div>
              <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">智能学习</h4>
              <p className="text-sm text-gray-600">AI角色会根据对话内容不断学习，提升个性化回应能力</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Users className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
              </div>
              <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">多角色协作</h4>
              <p className="text-sm text-gray-600">支持多个AI角色同时参与对话，实现协作式问题解决</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <MessageCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
              </div>
              <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">实时互动</h4>
              <p className="text-sm text-gray-600">流畅的实时对话体验，支持文本、语音等多种交互方式</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <MessageSquare className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600" />
              </div>
              <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">群聊协作</h4>
              <p className="text-sm text-gray-600">所有AI角色在同一群聊中互动，形成丰富的多角色对话体验</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
