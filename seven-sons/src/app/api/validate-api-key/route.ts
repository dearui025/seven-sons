import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { provider, apiKey, host, model } = await request.json()
    
    console.log('[API验证] 验证参数:', {
      provider,
      apiKey: apiKey ? `${apiKey.substring(0, 10)}...` : 'undefined',
      host,
      model
    })

    if (!apiKey || apiKey.trim() === '') {
      return NextResponse.json({
        success: false,
        error: 'API密钥不能为空'
      })
    }

    // 检查是否为占位符或测试密钥
    if (apiKey.includes('your_') || 
        apiKey.includes('your-api-key') ||
        apiKey.includes('test-demo-key') ||
        apiKey.includes('sk-test-') ||
        apiKey.includes('xxxxxxxx')) {
      return NextResponse.json({
        success: false,
        error: 'API密钥不能是占位符或测试密钥'
      })
    }

    // 根据提供商验证密钥格式
    switch (provider) {
      case 'openai':
        if (!apiKey.startsWith('sk-') || apiKey.length < 20) {
          return NextResponse.json({
            success: false,
            error: 'OpenAI API密钥格式无效，应以sk-开头且长度至少20字符'
          })
        }
        break
      case 'anthropic':
        if (!apiKey.startsWith('sk-ant-') || apiKey.length < 20) {
          return NextResponse.json({
            success: false,
            error: 'Anthropic API密钥格式无效，应以sk-ant-开头且长度至少20字符'
          })
        }
        break
      case 'chatanywhere':
        if (!apiKey.startsWith('sk-') || apiKey.length < 10) {
          return NextResponse.json({
            success: false,
            error: 'ChatAnywhere API密钥格式无效，应以sk-开头且长度至少10字符'
          })
        }
        break
      case 'dmxapi':
        if (apiKey.length < 10) {
          return NextResponse.json({
            success: false,
            error: 'DMXapi API密钥长度不足，至少需要10字符'
          })
        }
        break
      default:
        return NextResponse.json({
          success: false,
          error: `不支持的API提供商: ${provider}`
        })
    }

    // 实际测试API调用
    let endpoint: string
    let testModel = model || 'gpt-3.5-turbo'

    switch (provider) {
      case 'openai':
        endpoint = 'https://api.openai.com/v1/chat/completions'
        break
      case 'anthropic':
        // Anthropic使用不同的API结构，这里简化处理
        return NextResponse.json({
          success: true,
          message: 'Anthropic API密钥格式验证通过（未进行实际调用测试）'
        })
      case 'chatanywhere':
        const chatHost = host || 'https://api.chatanywhere.tech'
        endpoint = `${chatHost}/v1/chat/completions`
        break
      case 'dmxapi':
        const dmxHost = host || 'https://www.DMXapi.com'
        const buildEndpoint = (b: string) => {
          const clean = b.trim().replace(/\/+$/g, '')
          if (clean.endsWith('/v1/chat/completions')) return clean
          if (clean.endsWith('/v1')) return `${clean}/chat/completions`
          return `${clean}/v1/chat/completions`
        }
        endpoint = buildEndpoint(dmxHost)
        testModel = model || 'grok-3-beta'
        break
      default:
        return NextResponse.json({
          success: false,
          error: `不支持的API提供商: ${provider}`
        })
    }

    // 发送测试请求
    const testMessages = [
      { role: 'system', content: '你是一个AI助手。' },
      { role: 'user', content: '请回复"测试成功"' }
    ]

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: testModel,
        messages: testMessages,
        temperature: 0.7,
        max_tokens: 10,
      }),
    })

    console.log('[API验证] 测试响应状态:', response.status, response.statusText)

    if (!response.ok) {
      const text = await response.text()
      console.error('[API验证] 测试失败响应:', text)
      
      // 解析错误信息
      let errorMessage = `API调用失败: HTTP ${response.status}`
      try {
        const errorData = JSON.parse(text)
        if (errorData.error?.message) {
          errorMessage = errorData.error.message
        }
      } catch (e) {
        // 忽略JSON解析错误
      }
      
      return NextResponse.json({
        success: false,
        error: errorMessage,
        details: text.slice(0, 200)
      })
    }

    const data = await response.json()
    console.log('[API验证] 测试成功')
    
    return NextResponse.json({
      success: true,
      message: 'API密钥验证成功',
      testResponse: data.choices?.[0]?.message?.content || '测试调用成功'
    })

  } catch (error) {
    console.error('[API验证] 验证失败:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '验证过程中发生未知错误'
    })
  }
}