'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { fetchJsonWithRetry, getNetworkErrorMessage, isOnline, onNetworkChange } from '@/lib/network-utils'
import { getAllAIRoles, deleteAIRole } from '@/lib/database-setup'

export default function RolesManagementTest() {
  const { user } = useAuth()
  
  return (
    <div className="p-8">
      <h1>角色管理测试页面</h1>
      <p>这是一个简化的角色管理页面，用于测试。</p>
      <p>用户: {user?.email || '未登录'}</p>
    </div>
  )
}