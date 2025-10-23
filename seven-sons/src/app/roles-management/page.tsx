'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Edit, Trash2, Settings, Upload, Save, X } from 'lucide-react'
import { getAllAIRoles, deleteAIRole } from '@/lib/database-setup'
import { type AIRole } from '@/types/ai-roles'
import Image from 'next/image'
import AvatarUpload from '@/components/ui/AvatarUpload'
import ApiConfig from '@/components/ui/ApiConfig'
import { fetchJsonWithRetry, getNetworkErrorMessage, isOnline, onNetworkChange } from '@/lib/network-utils'
import { useAuth } from '@/contexts/AuthContext'
import { DEMO_MODE } from '@/lib/supabase'

const TABS = [
  { key: 'basic', label: '基本信息' },
  { key: 'avatar', label: '头像设置' },
  { key: 'api', label: 'API配置' }
] as const

export default function RoleManagement() {
  const router = useRouter()
  const { user } = useAuth()
  const [roles, setRoles] = useState<AIRole[]>([])
  const [loading, setLoading] = useState(true)
  const [editingRole, setEditingRole] = useState<AIRole | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [activeTab, setActiveTab] = useState<'basic' | 'avatar' | 'api'>('basic')
  const [connStatus, setConnStatus] = useState<Record<string, {status:'idle'|'testing'|'success'|'error', latency?: number}>>({})
  const [saveState, setSaveState] = useState<{status: 'idle' | 'saving' | 'success' | 'error', message?: string}>({status: 'idle'})
  const [networkStatus, setNetworkStatus] = useState<boolean>(true)
  const [formData, setFormData] = useState<Partial<AIRole>>({
    name: '',
    description: '',
    avatar_url: '',
    personality: '',
    specialties: [],
    learning_progress: {
      level: 1,
      experience: 0,
      skills: [],
      achievements: []
    },
    settings: {
      tone: 'friendly',
      creativity: 75,
      verbosity: 'moderate',
      language_style: '现代实用',
      ai_only_mode: false
    },
    api_config: {
      provider: 'openai',
      apiKey: '',
      model: 'gpt-3.5-turbo',
      temperature: 0.7,
      maxTokens: 2048,
      systemPrompt: '',
      host: ''
    }
  })
  const [autoFillState, setAutoFillState] = useState<{status:'idle'|'loading'|'success'|'error', message?: string}>({status:'idle'})
  const [showMineOnly, setShowMineOnly] = useState(false)
  const autoFillTimer = useRef<number | null>(null)

  // 初始化与持久化“只看我的”筛选状态（必须在组件内部使用 Hook）
  useEffect(() => {
    try {
      const saved = localStorage.getItem('roles_filter_showMineOnly')
      if (saved !== null) {
        setShowMineOnly(saved === 'true')
      }
    } catch (e) {
      console.warn('读取本地筛选状态失败:', e)
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem('roles_filter_showMineOnly', String(showMineOnly))
    } catch (e) {
      console.warn('保存本地筛选状态失败:', e)
    }
  }, [showMineOnly])

  useEffect(() => {
    console.log('🚀 角色管理页面初始化 - 开始')
    console.log('当前环境:', {
      NODE_ENV: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    })
    loadRoles()
  }, [])

  // 监控连接状态变化
  useEffect(() => {
    console.log('📊 连接状态更新:', connStatus)
    console.log('📊 连接状态详情:', Object.entries(connStatus).map(([id, status]) => ({
      角色ID: id,
      状态: status.status,
      延迟: status.latency
    })))
  }, [connStatus])

  useEffect(() => {
    // 监听网络状态变化
    const cleanup = onNetworkChange((online) => {
      setNetworkStatus(online)
      if (online) {
        console.log('网络已恢复，重新加载数据')
        loadRoles()
      } else {
        console.warn('网络连接已断开')
      }
    })

    return cleanup
  }, [])

  // 单个角色连接状态检测函数
  const testSingleRoleConnection = async (role: AIRole) => {
    const id = role.id || role.name
    console.log(`🔍 开始检测角色连接状态: ${role.name} (ID: ${id})`)
    console.log(`🔍 角色API配置详情:`, {
      provider: role.api_config?.provider,
      hasApiKey: !!role.api_config?.apiKey,
      apiKeyLength: role.api_config?.apiKey?.length,
      model: role.api_config?.model,
      host: role.api_config?.host
    })
    
    if (!role.api_config?.apiKey || !role.api_config?.provider) {
      console.log(`⚪ 角色 ${role.name} 没有API配置，设置为idle状态`)
      setConnStatus(prev => {
        const newStatus = { ...prev, [id]: { status: 'idle' as const } }
        console.log(`⚪ 更新状态为idle:`, newStatus)
        return newStatus
      })
      return
    }
    
    console.log(`🟡 角色 ${role.name} 开始API连接测试`)
    
    try {
      setConnStatus(prev => {
        const newStatus = { ...prev, [id]: { status: 'testing' as const } }
        console.log(`🟡 更新状态为testing:`, newStatus)
        return newStatus
      })
      
      console.log(`📡 发送API测试请求到 /api/llm-test`)
      
      // 使用带重试机制的网络请求
      const data = await fetchJsonWithRetry('/api/llm-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: role.api_config.provider,
          apiKey: role.api_config.apiKey,
          host: role.api_config.host,
          model: role.api_config.model
        }),
        maxRetries: 2,
        timeout: 15000
      })
      
      console.log(`📡 角色 ${role.name} API测试响应:`, data)
      
      if (data.ok) {
        console.log(`🟢 角色 ${role.name} 连接成功，延迟: ${data.latency_ms}ms`)
        setConnStatus(prev => {
          const newStatus = { ...prev, [id]: { status: 'success' as const, latency: data.latency_ms } }
          console.log(`🟢 更新状态为success:`, newStatus)
          return newStatus
        })
      } else {
        console.log(`🔴 角色 ${role.name} 连接失败:`, data.message)
        setConnStatus(prev => {
          const newStatus = { ...prev, [id]: { status: 'error' as const } }
          console.log(`🔴 更新状态为error:`, newStatus)
          return newStatus
        })
      }
    } catch (error) {
      console.error(`🔴 角色 ${role.name} API连接测试异常:`, error)
      setConnStatus(prev => {
        const newStatus = { ...prev, [id]: { status: 'error' as const } }
        console.log(`🔴 更新状态为error (异常):`, newStatus)
        return newStatus
      })
    }
  }

  useEffect(() => {
    const run = async () => {
      console.log(`🚀 开始并行检测 ${roles.length} 个角色的连接状态`)
      console.log(`🚀 角色列表:`, roles.map(r => ({ 
        id: r.id, 
        name: r.name, 
        hasApiConfig: !!r.api_config,
        provider: r.api_config?.provider,
        hasApiKey: !!r.api_config?.apiKey
      })))
      
      if (roles.length === 0) {
        console.log(`⚠️ 没有角色需要检测连接状态`)
        return
      }
      
      // 并行检测所有角色的连接状态，避免串行检测导致的状态互相影响
      const promises = roles.map(role => testSingleRoleConnection(role))
      await Promise.allSettled(promises)
      console.log(`✅ 完成所有角色连接状态检测`)
    }

    if (roles.length > 0) {
      run()
    }
  }, [roles])

  const loadRoles = async () => {
    try {
      console.log('📥 开始加载角色数据')
      setLoading(true)
      const rolesData = await getAllAIRoles()
      console.log('📋 加载到的角色数据:', rolesData.map(r => ({ 
        id: r.id,
        name: r.name, 
        hasApiKey: !!r.api_config?.apiKey,
        provider: r.api_config?.provider 
      })))
      setRoles(rolesData)
      console.log('📋 角色数据设置完成，触发连接状态检测')
    } catch (error) {
      console.error('❌ 加载角色失败:', error)
      const errorMessage = getNetworkErrorMessage(error)
      setSaveState({status: 'error', message: `加载角色失败: ${errorMessage}`})
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (role: AIRole) => {
    setEditingRole(role)
    
    // 确保 api_config 的所有字段都有默认值
    const defaultApiConfig = {
      provider: 'openai',
      apiKey: '',
      model: 'gpt-3.5-turbo',
      temperature: 0.7,
      maxTokens: 2048,
      systemPrompt: '',
      host: ''
    }
    
    const mergedApiConfig = {
      ...defaultApiConfig,
      ...role.api_config,
      // 确保数值字段是正确的类型
      temperature: typeof role.api_config?.temperature === 'number' 
        ? role.api_config.temperature 
        : (typeof role.api_config?.temperature === 'string' 
          ? parseFloat(role.api_config.temperature) 
          : 0.7),
      maxTokens: typeof role.api_config?.maxTokens === 'number' 
        ? role.api_config.maxTokens 
        : (typeof role.api_config?.maxTokens === 'string' 
          ? parseInt(role.api_config.maxTokens) 
          : 2048)
    }
    
    console.log('编辑角色 - API配置合并:', {
      原始配置: role.api_config,
      合并后配置: mergedApiConfig
    })
    
    setFormData({
      ...role,
      specialties: [...role.specialties],
      api_config: mergedApiConfig
    })
    setShowCreateForm(true)
    setActiveTab('basic')
  }

  const handleCreate = () => {
    setEditingRole(null)
    setFormData({
      name: '',
      description: '',
      avatar_url: '',
      personality: '',
      specialties: [],
      learning_progress: {
        level: 1,
        experience: 0,
        skills: [],
        achievements: []
      },
      settings: {
        tone: 'friendly',
        creativity: 75,
        verbosity: 'moderate',
        language_style: '现代实用'
      },
      api_config: {
        provider: 'openai',
        apiKey: '',
        model: 'gpt-3.5-turbo',
        temperature: 0.7,
        maxTokens: 2048,
        systemPrompt: '',
        host: ''
      }
    })
    setShowCreateForm(true)
    setActiveTab('basic')
  }

  const handleSave = async () => {
    try {
      console.log('=== 开始保存角色 ===')
      console.log('当前formData:', JSON.stringify(formData, null, 2))
      console.log('编辑中的角色ID:', editingRole?.id)
      
      // 检查网络状态
      if (!isOnline()) {
        setSaveState({status: 'error', message: '网络连接已断开，请检查网络设置'})
        return
      }
      
      setSaveState({status: 'saving'})
      
      // 验证必要字段
      if (!formData.name?.trim()) {
        console.error('角色名称为空')
        setSaveState({status: 'error', message: '请输入角色名称'})
        return
      }

      if (!formData.description?.trim()) {
        console.error('角色描述为空')
        setSaveState({status: 'error', message: '请输入角色描述'})
        return
      }

      // 验证API配置
      if (formData.api_config) {
        console.log('验证API配置:', formData.api_config)
        
        if (!formData.api_config.provider) {
          console.error('API提供商未选择')
          setSaveState({status: 'error', message: '请选择API提供商'})
          return
        }

        if (!formData.api_config.apiKey?.trim()) {
          console.error('API密钥为空')
          setSaveState({status: 'error', message: '请输入API密钥'})
          return
        }

        if (!formData.api_config.model?.trim()) {
          console.error('模型未选择')
          setSaveState({status: 'error', message: '请选择模型'})
          return
        }

        // 验证数值类型 - 添加类型转换和更详细的调试信息
        let temperature = formData.api_config.temperature
        
        // 处理 undefined 或 null 的情况
        if (temperature === undefined || temperature === null) {
          temperature = 0.7 // 默认值
          console.log('温度值为空，使用默认值:', temperature)
        } else if (typeof temperature === 'string') {
          temperature = parseFloat(temperature)
          console.log('温度值从字符串转换:', temperature)
        }
        
        console.log('温度值验证:', {
          原始值: formData.api_config.temperature,
          类型: typeof formData.api_config.temperature,
          转换后: temperature,
          转换后类型: typeof temperature
        })
        
        if (isNaN(temperature) || temperature < 0 || temperature > 2) {
          console.error('温度值无效:', { temperature, 原始值: formData.api_config.temperature })
          setSaveState({status: 'error', message: '温度值必须在0-2之间'})
          return
        }
        
        // 确保温度值是数字类型
        formData.api_config.temperature = temperature

        let maxTokens = formData.api_config.maxTokens
        
        // 处理 undefined 或 null 的情况
        if (maxTokens === undefined || maxTokens === null) {
          maxTokens = 2048 // 默认值
          console.log('最大Token数为空，使用默认值:', maxTokens)
        } else if (typeof maxTokens === 'string') {
          maxTokens = parseInt(maxTokens)
          console.log('最大Token数从字符串转换:', maxTokens)
        }
          
        console.log('最大Token数验证:', {
          原始值: formData.api_config.maxTokens,
          类型: typeof formData.api_config.maxTokens,
          转换后: maxTokens,
          转换后类型: typeof maxTokens
        })
        
        if (isNaN(maxTokens) || maxTokens < 1 || maxTokens > 8192) {
          console.error('最大Token数无效:', { maxTokens, 原始值: formData.api_config.maxTokens })
          setSaveState({status: 'error', message: '最大Token数必须在1-8192之间'})
          return
        }
        
        // 确保最大Token数是数字类型
        formData.api_config.maxTokens = maxTokens
      }

      let result: boolean
      
      if (editingRole?.id) {
        console.log('更新现有角色（通过服务端API）')
        const resp = await fetch('/api/ai-roles/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roleId: editingRole.id, roleData: formData })
        })
        const json = await resp.json()
        result = !!(resp.ok && json?.success)
      } else {
        console.log('创建新角色（通过服务端API）')
        const resp = await fetch('/api/ai-roles/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roleData: formData, ownerUserId: user?.id || 'demo-user-id' })
        })
        const json = await resp.json()
        result = !!(resp.ok && json?.success)
      }

      if (result) {
        console.log('角色保存成功')
        setSaveState({status: 'success', message: '保存成功'})
        
        // 重新加载角色列表（这会自动触发useEffect中的连接状态检测）
        await loadRoles()
        
        // 关闭编辑表单
        setEditingRole(null)
        setShowCreateForm(false)
        
        // 3秒后重置保存状态
        setTimeout(() => {
          setSaveState({status: 'idle'})
        }, 3000)
      } else {
        console.error('角色保存失败')
        setSaveState({status: 'error', message: '保存失败，请重试'})
      }
    } catch (error: any) {
      console.error('=== handleSave函数执行失败 ===')
      console.error('错误对象:', error)
      console.error('错误消息:', error?.message)
      console.error('错误堆栈:', error?.stack)
      
      const errorMessage = getNetworkErrorMessage(error)
      setSaveState({status: 'error', message: errorMessage})
    }
  }

  const handleDelete = async (roleId: string) => {
    if (!confirm('确定要删除这个角色吗？此操作不可恢复。')) {
      return
    }

    try {
      await deleteAIRole(roleId)
      await loadRoles()
    } catch (error) {
      console.error('删除角色失败:', error)
      alert('删除失败，请重试')
    }
  }

  const handleSpecialtyChange = (index: number, value: string) => {
    const newSpecialties = [...(formData.specialties || [])]
    newSpecialties[index] = value
    setFormData({ ...formData, specialties: newSpecialties })
  }

  const addSpecialty = () => {
    setFormData({
      ...formData,
      specialties: [...(formData.specialties || []), '']
    })
  }

  const removeSpecialty = (index: number) => {
    const newSpecialties = [...(formData.specialties || [])]
    newSpecialties.splice(index, 1)
    setFormData({ ...formData, specialties: newSpecialties })
  }

  const handleAvatarUpload = (file: File) => {
    // 创建本地URL用于预览
    const url = URL.createObjectURL(file)
    setFormData({ ...formData, avatar_url: url })
    
    // 这里可以添加实际的文件上传逻辑
    console.log('上传头像文件:', file)
  }

  const handleAutoFill = async (nameOverride?: string) => {
    try {
      const roleName = (nameOverride ?? formData.name ?? '').trim()
      if (!roleName) {
        setAutoFillState({ status: 'error', message: '请先输入角色名称' })
        return
      }
      setAutoFillState({ status: 'loading' })

      const resp = await fetch('/api/ai-roles/auto-fill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: roleName,
          // 自动填充统一使用 dmxapi，避免出现“暂不支持提供商”的错误
          provider: 'dmxapi',
          apiKey: formData.api_config?.apiKey,
          host: formData.api_config?.host,
          model: formData.api_config?.model
        })
      })
      const json = await resp.json()

      if (resp.ok && json?.success) {
        const data = json.data
        setFormData(prev => ({
          ...prev,
          description: data.description,
          personality: data.personality,
          specialties: data.specialties,
          settings: { ...(prev.settings || {}), ...data.settings },
          api_config: {
            ...(prev.api_config || {
              provider: 'openai',
              apiKey: '',
              model: 'gpt-3.5-turbo',
              temperature: 0.7,
              maxTokens: 2048,
              systemPrompt: '',
              host: ''
            }),
            systemPrompt: data.systemPrompt
          }
        }))
        setAutoFillState({ status: 'success', message: '已自动生成基本信息，可继续调整后保存' })
      } else {
        setAutoFillState({ status: 'error', message: json?.message || '生成失败' })
      }
    } catch (error) {
      console.error('AI自动生成失败:', error)
      setAutoFillState({ status: 'error', message: '网络或服务错误' })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">加载中...</div>
      </div>
    )
  }

  const filteredRoles = showMineOnly ? roles.filter(role => {
    const ownerId = (role.settings as any)?.owner_user_id
    if (ownerId && user?.id) return ownerId === user.id
    // 演示模式下默认数据，名称为“我自己”的角色视为当前用户的角色
    return role.name === '我自己'
  }) : roles

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* 网络状态提示 */}
        {!networkStatus && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            <div className="flex items-center">
              <span className="mr-2">⚠️</span>
              网络连接已断开，部分功能可能不可用
            </div>
          </div>
        )}

        {/* 保存状态提示 */}
        {saveState.status !== 'idle' && (
          <div className={`mb-4 p-3 rounded border ${
            saveState.status === 'saving' ? 'bg-blue-100 border-blue-400 text-blue-700' :
            saveState.status === 'success' ? 'bg-green-100 border-green-400 text-green-700' :
            'bg-red-100 border-red-400 text-red-700'
          }`}>
            <div className="flex items-center">
              {saveState.status === 'saving' && <span className="mr-2">⏳</span>}
              {saveState.status === 'success' && <span className="mr-2">✅</span>}
              {saveState.status === 'error' && <span className="mr-2">❌</span>}
              {saveState.message || (
                saveState.status === 'saving' ? '正在保存...' :
                saveState.status === 'success' ? '保存成功' :
                '保存失败'
              )}
            </div>
          </div>
        )}

        {DEMO_MODE && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-300 text-yellow-800 rounded">
            当前处于 DEMO 模式或数据库不可用，已回退到内置角色（DEFAULT_AI_ROLES）。部分数据可能不会持久化到 Supabase。
          </div>
        )}

        {/* 页面标题 */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">角色管理</h1>
            <p className="text-gray-600">管理和配置AI角色</p>
          </div>
          <button
            onClick={handleCreate}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            创建新角色
          </button>
        </div>

        <div className="flex items-center justify-end mb-4">
          <label className="inline-flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={showMineOnly}
              onChange={(e) => setShowMineOnly(e.target.checked)}
            />
            只看我的角色
          </label>
        </div>

        {/* 角色列表 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRoles.map((role, index) => (
            <div key={role.id || `idx-${index}`} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              {/* 角色头像和基本信息 */}
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100">
                  <Image
                    src={role.avatar_url}
                    alt={role.name}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    {role.name}
                    {(user?.id && (role.settings as any)?.owner_user_id === user.id) && (
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">我的</span>
                    )}
                    {(() => {
                      const status = connStatus[role.id || role.name]?.status
                      const latency = connStatus[role.id || role.name]?.latency
                      
                      console.log(`🎯 渲染角色 ${role.name} 状态灯:`, { 
                        roleId: role.id || role.name, 
                        status, 
                        latency,
                        connStatusKeys: Object.keys(connStatus)
                      })
                      
                      let statusClass = 'bg-gray-300' // 默认灰色
                      let title = '未知状态'
                      
                      switch (status) {
                        case 'success':
                          statusClass = 'bg-green-500'
                          title = `连接成功${latency ? ` (${latency}ms)` : ''}`
                          break
                        case 'testing':
                          statusClass = 'bg-yellow-400 animate-pulse'
                          title = '检测中...'
                          break
                        case 'error':
                          statusClass = 'bg-red-500'
                          title = '连接失败'
                          break
                        case 'idle':
                          statusClass = 'bg-gray-400'
                          title = '未配置API'
                          break
                        default:
                          statusClass = 'bg-gray-300'
                          title = '未知状态'
                      }
                      
                      return (
                        <span 
                          className={`inline-block w-2.5 h-2.5 rounded-full ${statusClass}`}
                          title={title}
                        />
                      )
                    })()}
                  </h3>
                  <p className="text-gray-600 text-sm">{role.description}</p>
                </div>
              </div>

              {/* 角色属性 */}
              <div className="space-y-2 mb-4">
                <div>
                  <span className="text-sm font-medium text-gray-700">个性：</span>
                  <span className="text-sm text-gray-600">{role.personality}</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">专长：</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {role.specialties.slice(0, 3).map((specialty, index) => (
                      <span
                        key={`${role.id}-specialty-${index}-${specialty}`}
                        className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                      >
                        {specialty}
                      </span>
                    ))}
                    {role.specialties.length > 3 && (
                      <span key={`${role.id}-more-specialties`} className="text-xs text-gray-500">+{role.specialties.length - 3}</span>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">等级：</span>
                  <span className="text-sm text-gray-600">Lv.{role.learning_progress.level}</span>
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(role)}
                  className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  编辑
                </button>
                <button
                  onClick={() => handleDelete(role.id!)}
                  className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  删除
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* 创建/编辑表单模态框 */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingRole ? '编辑角色' : '创建新角色'}
                  </h2>
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* 标签页导航 */}
                <div className="flex border-b border-gray-200 mb-6">
                  {TABS.map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key as 'basic' | 'avatar' | 'api')}
                      className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                        activeTab === tab.key
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* 标签页内容 */}
                {activeTab === 'basic' && (
                  <div className="space-y-6">
                    {/* 基本信息 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          角色名称 *
                        </label>
                        <input
                          type="text"
                          value={formData.name || ''}
                          onChange={(e) => {
                            const newName = e.target.value
                            setFormData({ ...formData, name: newName })
                            if (formData.settings?.ai_only_mode) {
                              if (autoFillTimer.current) {
                                clearTimeout(autoFillTimer.current)
                              }
                              autoFillTimer.current = window.setTimeout(() => {
                                handleAutoFill(newName)
                              }, 500)
                            }
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="输入角色名称"
                        />
                        <div className="mt-2 flex items-center gap-2">
                          <button
                            onClick={() => handleAutoFill()}
                            className="text-blue-600 hover:text-blue-700 text-sm"
                            type="button"
                          >
                            AI智能生成基本信息
                          </button>
                          {autoFillState.status === 'loading' && (
                            <span className="text-gray-500 text-sm">生成中...</span>
                          )}
                          {autoFillState.status === 'success' && (
                            <span className="text-green-600 text-sm">生成完成 ✅</span>
                          )}
                          {autoFillState.status === 'error' && (
                            <span className="text-red-600 text-sm">{autoFillState.message || '生成失败'}</span>
                          )}
                        </div>
                        <div className="mt-2">
                          <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                            <input
                              type="checkbox"
                              checked={!!formData.settings?.ai_only_mode}
                              onChange={(e) => setFormData({
                                ...formData,
                                settings: { ...formData.settings!, ai_only_mode: e.target.checked }
                              })}
                            />
                            AI-only 模式：根据名称自动生成基本信息
                          </label>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          头像URL
                        </label>
                        <input
                          type="text"
                          value={formData.avatar_url || ''}
                          onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="/avatars/example.svg"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        角色描述 *
                      </label>
                      <textarea
                        value={formData.description || ''}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="描述角色的特点和背景"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        个性特点
                      </label>
                      <input
                        type="text"
                        value={formData.personality || ''}
                        onChange={(e) => setFormData({ ...formData, personality: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="描述角色的性格特点"
                      />
                    </div>

                    {/* 专长技能 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        专长技能
                      </label>
                      <div className="space-y-2">
                        {(formData.specialties || []).map((specialty, index) => (
                          <div key={`specialty-${index}-${specialty}`} className="flex gap-2">
                            <input
                              type="text"
                              value={specialty}
                              onChange={(e) => handleSpecialtyChange(index, e.target.value)}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="输入专长技能"
                            />
                            <button
                              onClick={() => removeSpecialty(index)}
                              className="text-red-500 hover:text-red-700 px-2"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={addSpecialty}
                          className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                        >
                          <Plus className="w-4 h-4" />
                          添加专长
                        </button>
                      </div>
                    </div>

                    {/* 设置选项 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          语调风格
                        </label>
                        <select
                          value={formData.settings?.tone || 'friendly'}
                          onChange={(e) => setFormData({
                            ...formData,
                            settings: { ...formData.settings!, tone: e.target.value }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="friendly">友好</option>
                          <option value="formal">正式</option>
                          <option value="casual">随意</option>
                          <option value="humorous">幽默</option>
                          <option value="wise">智慧</option>
                          <option value="poetic">诗意</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          创造力 ({formData.settings?.creativity || 75})
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={formData.settings?.creativity || 75}
                          onChange={(e) => setFormData({
                            ...formData,
                            settings: { ...formData.settings!, creativity: parseInt(e.target.value) }
                          })}
                          className="w-full"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          详细程度
                        </label>
                        <select
                          value={formData.settings?.verbosity || 'moderate'}
                          onChange={(e) => setFormData({
                            ...formData,
                            settings: { ...formData.settings!, verbosity: e.target.value }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="concise">简洁</option>
                          <option value="moderate">适中</option>
                          <option value="detailed">详细</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          语言风格
                        </label>
                        <input
                          type="text"
                          value={formData.settings?.language_style || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            settings: { ...formData.settings!, language_style: e.target.value }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="例如：现代实用、古典优雅"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'avatar' && (
                  <div className="space-y-6">
                    <AvatarUpload
                      currentAvatar={formData.avatar_url}
                      onAvatarChange={(file, previewUrl) => setFormData({ ...formData, avatar_url: previewUrl })}
                    />
                  </div>
                )}

                {activeTab === 'api' && (
                  <div className="space-y-6">
                    <ApiConfig
                      settings={formData.api_config || {
                        provider: 'openai',
                        apiKey: '',
                        model: 'gpt-3.5-turbo',
                        temperature: 0.7,
                        maxTokens: 2048,
                        systemPrompt: '',
                        host: ''
                      }}
                      onChange={(config) => setFormData({ ...formData, api_config: config })}
                    />
                  </div>
                )}

                {/* 状态消息 */}
                {saveState.status !== 'idle' && (
                  <div className={`mt-6 p-3 rounded-lg ${
                    saveState.status === 'success' ? 'bg-green-50 text-green-700 border border-green-200' :
                    saveState.status === 'error' ? 'bg-red-50 text-red-700 border border-red-200' :
                    'bg-blue-50 text-blue-700 border border-blue-200'
                  }`}>
                    {saveState.message || (saveState.status === 'saving' ? '正在保存...' : '')}
                  </div>
                )}

                {/* 操作按钮 */}
                <div className="flex gap-3 mt-8">
                  <button
                    onClick={() => {
                      setShowCreateForm(false)
                      setSaveState({ status: 'idle' })
                    }}
                    disabled={saveState.status === 'saving'}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saveState.status === 'saving'}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saveState.status === 'saving' ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        保存中...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        保存
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}