import { NextRequest, NextResponse } from 'next/server'
import { AIService } from '@/lib/ai-service'
import { getAllAIRoles } from '@/lib/database-setup'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    // 身份验证检查
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // 从请求头获取授权token
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({
        success: false,
        error: '未登录，请先登录后使用'
      }, { status: 401 })
    }

    // 验证token
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json({
        success: false,
        error: '登录已过期，请重新登录'
      }, { status: 401 })
    }

    console.log(`[聊天API] 已验证用户: ${user.email}`)

    const { message, roleName, sessionId, userId } = await request.json()
    
    console.log(`[聊天API] 收到请求:`, {
      角色: roleName,
      消息长度: message?.length,
      会话ID: sessionId,
      用户ID: userId
    })

    if (!message || !roleName || !sessionId) {
      return NextResponse.json({
        success: false,
        error: '缺少必要参数: message, roleName, sessionId'
      }, { status: 400 })
    }

    // 获取角色信息
    const roles = await getAllAIRoles()
    const role = roles.find(r => r.name === roleName)
    
    if (!role) {
      return NextResponse.json({
        success: false,
        error: `未找到角色: ${roleName}`
      }, { status: 404 })
    }

    console.log(`[聊天API] 找到角色:`, {
      角色名: role.name,
      角色ID: role.id,
      有API配置: !!role.api_config,
      API提供商: role.api_config?.provider
    })

    // 调用AI服务生成回复
    const response = await AIService.generateResponse(role, message, sessionId, userId)

    return NextResponse.json({
      success: true,
      data: {
        content: response.content,
        role: roleName,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('[聊天API] 处理请求失败:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '服务器内部错误'
    }, { status: 500 })
  }
}