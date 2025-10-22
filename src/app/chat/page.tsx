"use client"

import React, { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ChatInterface } from '@/components/chat/ChatInterface'
import { useChat } from '@/contexts/ChatContext'
import { DEFAULT_AI_ROLES } from '@/types/ai-roles'
import { getAllAIRoles } from '@/lib/database-setup'
import { ErrorBoundaryWrapper } from '@/components/ErrorBoundary'

export default function ChatPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const roleNameParam = searchParams.get('roleName') || ''
  const [availableRoles, setAvailableRoles] = useState(DEFAULT_AI_ROLES)
  const [isLoadingRoles, setIsLoadingRoles] = useState(true)

  const {
    currentSession,
    currentRole,
    setCurrentRole,
    createSession,
    sessions,
  } = useChat()

  // 加载可用角色列表
  useEffect(() => {
    const loadRoles = async () => {
      try {
        setIsLoadingRoles(true)
        const roles = await getAllAIRoles()
        if (roles && roles.length > 0) {
          setAvailableRoles(roles)
        } else {
          console.warn('⚠️ 使用默认角色列表')
          setAvailableRoles(DEFAULT_AI_ROLES)
        }
      } catch (error) {
        console.error('❌ 加载角色列表失败:', error)
        setAvailableRoles(DEFAULT_AI_ROLES)
      } finally {
        setIsLoadingRoles(false)
      }
    }
    
    loadRoles()
  }, [])

  // 计算选中的角色
  const [selectedRole, setSelectedRole] = useState(null)

  useEffect(() => {
    // 当角色列表更新时，重新计算选中的角色
    if (isLoadingRoles || !availableRoles.length) return

    try {
      // 解码URL参数，处理特殊字符
      const decodedRoleName = decodeURIComponent(roleNameParam)
      const foundRole = availableRoles.find(r => r.name === decodedRoleName)
      
      if (foundRole) {
        setSelectedRole(foundRole)
      } else {
        console.warn('⚠️ 未找到角色:', decodedRoleName, '可用角色:', availableRoles.map(r => r.name).join(', '))
        setSelectedRole(availableRoles[0])
      }
    } catch (error) {
      console.error('❌ 角色名解码失败:', error)
      setSelectedRole(availableRoles[0])
    }
  }, [roleNameParam, availableRoles, isLoadingRoles])

  useEffect(() => {
    // 等待角色列表加载完成且有选中角色
    if (isLoadingRoles || !selectedRole) return

    try {
      // 如果没有会话或会话角色不匹配，则为该角色创建一个新的会话
      if (!currentSession || currentRole?.name !== selectedRole.name) {
        const mappedRole = {
          id: selectedRole.id ?? selectedRole.name,
          name: selectedRole.name,
          description: selectedRole.description || '',
          avatar: selectedRole.avatar_url || '🤖',
          color: selectedRole.color || '#6b7280',
          personality: selectedRole.personality || '',
          capabilities: selectedRole.specialties || [],
          api_config: selectedRole.api_config || undefined, // 保留API配置
        }
        
        setCurrentRole(mappedRole as any)

        // 检查是否已有该角色的会话
        const existing = sessions.find(s => s.role?.name === selectedRole.name)
        if (!existing) {
          // 使用角色名作为标题，角色ID用于关联
          createSession(selectedRole.name, mappedRole.id as any)
        }
      }
    } catch (error) {
      console.error('❌ 聊天会话初始化失败:', error)
      // 如果初始化失败，回到首页
      router.push('/')
    }
  }, [roleNameParam, selectedRole?.name, isLoadingRoles])

  // 当没有查询参数时，跳回首页
  useEffect(() => {
    try {
      if (!roleNameParam) {
        router.push('/')
      }
    } catch (error) {
      console.error('❌ 导航到首页失败:', error)
      // 如果router.push失败，使用window.location作为备用
      window.location.href = '/'
    }
  }, [roleNameParam])

  // 如果正在加载角色或没有选中角色，显示加载状态
  if (isLoadingRoles || !selectedRole) {
    return (
      <ErrorBoundaryWrapper>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">正在加载角色信息...</p>
          </div>
        </div>
      </ErrorBoundaryWrapper>
    )
  }

  return (
    <ErrorBoundaryWrapper>
      <div className="min-h-screen">
        <ChatInterface />
      </div>
    </ErrorBoundaryWrapper>
  )
}