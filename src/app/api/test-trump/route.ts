import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServiceClient } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    const supabase = createSupabaseServiceClient()
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase 未正确配置' }, { status: 500 })
    }

    // 查询所有角色
    const { data: allRoles, error: allError } = await supabase
      .from('ai_roles')
      .select('id, name, api_config, settings')

    if (allError) {
      return NextResponse.json({ error: '查询所有角色错误', details: allError }, { status: 500 })
    }

    // 查询特朗普角色
    const { data: trumpRoles, error: trumpError } = await supabase
      .from('ai_roles')
      .select('*')
      .ilike('name', '%特朗普%')

    if (trumpError) {
      return NextResponse.json({ error: '查询特朗普角色错误', details: trumpError }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      allRoles: allRoles?.map(role => ({
        id: role.id,
        name: role.name,
        hasApiConfig: !!role.api_config && Object.keys(role.api_config).length > 0,
        apiProvider: role.api_config?.provider,
        hasApiKey: !!role.api_config?.apiKey,
        apiKeyPreview: role.api_config?.apiKey ? role.api_config.apiKey.substring(0, 10) + '...' : null
      })),
      trumpRoles: trumpRoles || [],
      trumpCount: trumpRoles?.length || 0
    })

  } catch (error: any) {
    return NextResponse.json({ 
      error: '测试失败', 
      details: error?.message || '未知错误' 
    }, { status: 500 })
  }
}