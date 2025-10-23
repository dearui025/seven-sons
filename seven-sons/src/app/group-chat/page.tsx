'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { DEFAULT_AI_ROLES, type AIRole } from '@/types/ai-roles'
import { getAllAIRoles } from '@/lib/database-setup'
import { 
  MessageSquare, 
  Send, 
  ArrowLeft, 
  Users, 
  Clock,
  Sparkles
} from 'lucide-react'
import Avatar from '@/components/ui/avatar'
import { useAuth } from '@/contexts/AuthContext'

interface Message {
  id: string
  sender: string
  content: string
  timestamp: Date | string
  isUser: boolean
  avatar?: string
}

export default function GroupChatPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [aiRoles, setAiRoles] = useState<AIRole[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [showMineOnly, setShowMineOnly] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('group_chat_filter_showMineOnly')
      if (saved !== null) setShowMineOnly(saved === 'true')
    } catch (e) { console.warn('读取群聊筛选状态失败:', e) }
  }, [])

  useEffect(() => {
    try { localStorage.setItem('group_chat_filter_showMineOnly', String(showMineOnly)) }
    catch (e) { console.warn('保存群聊筛选状态失败:', e) }
  }, [showMineOnly])

  useEffect(() => {
    initializeGroupChat()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const initializeGroupChat = async () => {
    try {
      setIsLoading(true)
      
      // 加载AI角色
      const roles = await getAllAIRoles()
      if (roles.length > 0) {
        setAiRoles(roles)
      } else {
        setAiRoles(DEFAULT_AI_ROLES)
      }

      // 添加欢迎消息
      const welcomeMessage: Message = {
        id: 'welcome',
        sender: '系统',
        content: '欢迎来到AI角色群聊！所有角色都已加入群聊，开始你们的对话吧！',
        timestamp: new Date(),
        isUser: false,
        avatar: '🤖'
      }
      setMessages([welcomeMessage])
      
    } catch (error) {
      console.error('初始化群聊失败:', error)
      setAiRoles(DEFAULT_AI_ROLES)
    } finally {
      setIsLoading(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isSending) return

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: '用户',
      content: inputMessage.trim(),
      timestamp: new Date(),
      isUser: true,
      avatar: '👤'
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsSending(true)

    // 调用AI角色回复
    generateAIResponses(userMessage.content)
  }

  const generateAIResponses = async (userInput: string) => {
    try {
      setIsSending(true)
      
      // 调用新的群聊API
      const response = await fetch('/api/group-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userInput,
          sessionId: 'group-chat-session', // 可以根据需要生成唯一ID
          userId: 'demo-user' // 添加用户ID
        })
      })

      if (!response.ok) {
        throw new Error(`API请求失败: ${response.status}`)
      }

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.message || 'API响应失败')
      }

      const { aiResponses, interactions } = result.data

      // 添加AI响应到消息列表（带延迟效果）
      aiResponses.forEach((aiResponse: any) => {
        setTimeout(() => {
          setMessages(prev => [...prev, aiResponse])
        }, aiResponse.delay ?? 0)
      })

      // 添加角色互动（如果有的话）
      if (interactions && interactions.length > 0) {
        interactions.forEach((interaction: any) => {
          setTimeout(() => {
            setMessages(prev => [...prev, interaction])
          }, interaction.delay ?? 0)
        })
      }

    } catch (error) {
      console.error('生成AI响应失败:', error)
      
      // 显示错误消息
      const errorMessage = {
        id: `error-${Date.now()}`,
        sender: '系统',
        content: '抱歉，AI响应生成失败，请稍后重试。',
        timestamp: new Date(),
        isUser: false,
        avatar: '🤖'
      }
      
      setTimeout(() => {
        setMessages(prev => [...prev, errorMessage])
      }, 1000)
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <p className="mt-4 text-gray-600">正在初始化群聊...</p>
        </div>
      </div>
    )
  }

  const filteredAiRoles = showMineOnly
    ? aiRoles.filter(r => (r.settings as any)?.owner_user_id === (user?.id || 'demo-user-id'))
    : aiRoles

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      {/* 头部导航 */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/')}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>返回首页</span>
              </button>
              <div className="w-px h-6 bg-gray-300"></div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                   <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">AI角色群聊</h1>
                  <p className="text-sm text-gray-500">{filteredAiRoles.length}个角色在线</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-600">{filteredAiRoles.length + 1}人在群聊中</span>
            </div>
          </div>
        </div>
      </header>

      {/* 主要内容 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden h-[calc(100vh-200px)]">
          <div className="flex h-full">
            {/* 左侧角色列表 */}
            <div className="w-80 border-r border-gray-200 bg-gray-50">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">群聊成员</h3>
                <p className="text-sm text-gray-600">{filteredAiRoles.length + 1}位成员</p>
                <div className="mt-3 flex items-center justify-between">
                  <label className="flex items-center space-x-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={showMineOnly}
                      onChange={(e) => setShowMineOnly(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span>只看我的角色</span>
                  </label>
                  {showMineOnly && (
                    <span className="px-2 py-1 text-xs rounded bg-purple-100 text-purple-700">我的</span>
                  )}
                </div>
              </div>
              <div className="overflow-y-auto h-full">
                {/* 用户自己 */}
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">我</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">用户</p>
                      <p className="text-sm text-green-600">在线</p>
                    </div>
                  </div>
                </div>
                
                {/* AI角色列表 */}
                {filteredAiRoles.map((role, index) => (
                  <div key={index} className="p-4 border-b border-gray-100 hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <Avatar
                          src={role.avatar_url}
                          alt={role.name}
                          size={40}
                          fallback={role.name?.[0] ?? 'A'}
                        />
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{role.name}</p>
                        <p className="text-sm text-gray-500 truncate">{Array.isArray(role.specialties) && role.specialties.length > 0 ? role.specialties[0] : 'AI助手'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 右侧聊天区域 */}
            <div className="flex-1 flex flex-col">
              {/* 消息区域 */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex items-start space-x-3 max-w-2xl ${message.isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      {/* 头像 */}
                      <Avatar
                        src={message.avatar}
                        alt={message.sender}
                        size={32}
                        fallback={message.sender?.[0] ?? 'A'}
                        className="flex-shrink-0"
                      />
                      
                      {/* 消息内容 */}
                      <div className={`flex flex-col ${message.isUser ? 'items-end' : 'items-start'}`}>
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-sm font-medium text-gray-700">{message.sender}</span>
                          <span className="text-xs text-gray-400 flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <div
                          className={`px-4 py-2 rounded-2xl ${
                            message.isUser
                              ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* 正在输入指示器 */}
                {isSending && (
                  <div className="flex justify-start">
                    <div className="flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-2xl">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-sm text-gray-500">AI角色正在回复...</span>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* 输入区域 */}
              <div className="border-t border-gray-200 p-4">
                <div className="flex items-end space-x-4">
                  <div className="flex-1">
                    <textarea
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="输入消息，按Enter发送..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                      rows={1}
                      disabled={isSending}
                    />
                  </div>
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isSending}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>发送</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}