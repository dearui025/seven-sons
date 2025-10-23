'use client'

import { useState } from 'react'

interface ApiSettings {
  provider: string
  apiKey: string
  model: string
  temperature: number
  maxTokens: number
  systemPrompt: string
  host?: string
}

interface ApiConfigProps {
  settings: ApiSettings
  onChange: (settings: ApiSettings) => void
  className?: string
}

const API_PROVIDERS = [
  { value: 'openai', label: 'OpenAI' },
  { value: 'anthropic', label: 'Anthropic' },
  { value: 'google', label: 'Google AI' },
  { value: 'azure', label: 'Azure OpenAI' },
  { value: 'chatanywhere', label: 'ChatAnywhere(免费转发)' },
  { value: 'dmxapi', label: 'DMXapi(聚合转发)' },
  { value: 'local', label: '本地模型' }
]

const MODELS_BY_PROVIDER = {
  openai: [
    'gpt-4-turbo-preview',
    'gpt-4',
    'gpt-3.5-turbo',
    'gpt-3.5-turbo-16k'
  ],
  anthropic: [
    'claude-3-opus-20240229',
    'claude-3-sonnet-20240229',
    'claude-3-haiku-20240307'
  ],
  google: [
    'gemini-pro',
    'gemini-pro-vision'
  ],
  azure: [
    'gpt-4',
    'gpt-35-turbo'
  ],
  chatanywhere: [
    'deepseek',
    'gpt-3.5-turbo',
    'text-embedding-3-small',
    'gpt-4o',
    'gpt-5'
  ],
  dmxapi: [
    // OpenAI 3.5 / 4 / 4.1 系列
    'gpt-3.5-turbo',
    'gpt-3.5-turbo-0125',
    'gpt-3.5-turbo-1106',
    'gpt-3.5-turbo-16k',
    'gpt-3.5-turbo-16k-0613',
    'gpt-4',
    'gpt-4-0125-preview',
    'gpt-4-0613',
    'gpt-4-1106-preview',
    'gpt-4-32k',
    'gpt-4-32k-0613',
    'gpt-4-all',
    'gpt-4-turbo',
    'gpt-4-turbo-2024-04-09',
    'gpt-4-turbo-preview',
    'gpt-4.1',
    'gpt-4.1-2025-04-14',
    'gpt-4.1-mini',
    'gpt-4.1-mini-2025-04-14',
    'gpt-4.1-nano',
    'gpt-4o',
    'gpt-4o-mini',

    // DeepSeek 系列
    'deepseek-chat',
    'DeepSeek-Prover-V2',
    'deepseek-r1',
    'deepseek-r1-0528',
    'DeepSeek-R1-0528-128K',
    'deepseek-r1-250528',
    'DeepSeek-R1-Distill-Qwen-7B',
    'deepseek-r1-plus',
    'deepseek-reasoner',
    'deepseek-v3',
    'deepseek-v3-241226',
    'deepseek-v3.1',
    'deepseek-v3.1-nothinking',
    'deepseek-v3.1-thinking',
    'deepseek-v3.2-exp',
    'deepseek-v3.2-exp-thinking',
    'DMXAPI-DeepSeek-R1',
    'DMXAPI-DeepSeek-R1-32b',
    'DMXAPI-DeepSeek-R1-70b',
    'DMXAPI-DeepSeek-R1-long',

    // abab 系列
    'abab6-chat',
    'abab6.5s-chat',

    // Doubao（字节跳动）系列
    'doubao-1-5-thinking-vision-pro-250428',
    'Doubao-1.5-pro-256k',
    'Doubao-1.5-pro-32k',
    'Doubao-1.5-thinking-pro',
    'doubao-1.5-vision-pro-250328',
    'Doubao-lite-128k',
    'doubao-lite-32k',
    'Doubao-lite-32k',
    'doubao-lite-4k',
    'Doubao-lite-4k',
    'doubao-pro-128k',
    'Doubao-pro-128k',
    'doubao-pro-32k',
    'Doubao-pro-32k',
    'Doubao-pro-4k',
    'doubao-seed-1-6-251015',
    'doubao-seedream-4-0-250828',

    // GLM（智谱）系列
    'glm-4',
    'glm-4-flash',
    'GLM-4-FlashX',
    'GLM-4-Long',
    'glm-4-plus',
    'GLM-4.1V-9B-Thinking',
    'glm-4.5-airx',
    'GLM-4.5-Flash',
    'glm-4.5-x',
    'glm-4.6',
    'glm-4.6-thinking',
    'GLM-4V-Flash',
    'glm-4v-plus',
    'glm-zero-preview',
    'THUDM/glm-4-9b-chat',

    // Qwen 系列
    'qwen3-coder-plus',

    // 讯飞星火 Spark 系列
    'spark-4.0Ultra',
    'spark-lite',
    'spark-max',
    'spark-pro',
    'SparkDesk-v4.0',

    // 其它已添加的多模态与主流模型
    'hunyuan-t1-20250321',
    'qwen-max-latest',
    'ernie-4.0-8K',
    'moonshot-v1-32k',
    'claude-3-7-sonnet-20250219',
    'gemini-2.5-pro-exp-03-25',
    'grok-3-beta',
    'Meta-Llama-3.1-8B-Instruct',
    'gemini-1.5-flash',
    'gemini-1.5-pro',
    'claude-3-sonnet-20240229',
    'claude-3-haiku-20240307'
  ],
  local: [
    'llama2-7b',
    'llama2-13b',
    'codellama-7b'
  ]
}

export default function ApiConfig({ settings, onChange, className = '' }: ApiConfigProps) {
  const [showApiKey, setShowApiKey] = useState(false)
  const [testState, setTestState] = useState<{ status: 'idle' | 'testing' | 'success' | 'error', message?: string, latency?: number }>({ status: 'idle' })

  const handleChange = (field: keyof ApiSettings, value: any) => {
    const newSettings = { ...settings, [field]: value }
    
    // 当切换提供商时，重置模型选择
    if (field === 'provider') {
      newSettings.model = MODELS_BY_PROVIDER[value as keyof typeof MODELS_BY_PROVIDER]?.[0] || ''
      // ChatAnywhere 默认推荐国内host；DMXapi 默认主站
      if (value === 'chatanywhere') {
        newSettings.host = 'https://api.chatanywhere.tech'
      } else if (value === 'dmxapi') {
        newSettings.host = 'https://www.DMXapi.com'
      } else {
        newSettings.host = undefined
      }
    }
    
    onChange(newSettings)
  }

  const handleTestConnection = async () => {
    if (!settings.apiKey) {
      setTestState({ status: 'error', message: '请先填写 API Key' })
      return
    }
    setTestState({ status: 'testing' })
    try {
      const res = await fetch('/api/llm-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: settings.provider,
          apiKey: settings.apiKey,
          host: settings.host,
          model: settings.model
        })
      })
      const data = await res.json()
      if (data.ok) {
        setTestState({ status: 'success', latency: data.latency_ms })
      } else {
        setTestState({ status: 'error', message: data.message || '连接测试失败' })
      }
    } catch (e: any) {
      setTestState({ status: 'error', message: e?.message || '网络错误' })
    }
  }

  const availableModels = MODELS_BY_PROVIDER[settings.provider as keyof typeof MODELS_BY_PROVIDER] || []

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">API 配置</h3>
        
        {/* API 提供商 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            API 提供商
          </label>
          <select
            value={settings.provider}
            onChange={(e) => handleChange('provider', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {API_PROVIDERS.map(provider => (
              <option key={provider.value} value={provider.value}>
                {provider.label}
              </option>
            ))}
          </select>
        </div>

        {/* ChatAnywhere Host 设置与说明 */}
        {settings.provider === 'chatanywhere' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              转发 Host
            </label>
            <input
              type="text"
              value={settings.host || ''}
              onChange={(e) => handleChange('host', e.target.value)}
              placeholder="https://api.chatanywhere.tech"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="text-xs text-gray-500 mt-2 space-y-1">
              <p>国内优选：<span className="font-mono">https://api.chatanywhere.tech</span>（延迟较低）</p>
              <p>国外可选：<span className="font-mono">https://api.chatanywhere.org</span></p>
              <p>支持模型：deepseek、gpt-3.5-turbo、embedding、gpt-4o、gpt-5 系列</p>
              <p>如果没有 API Key，可在供应商处申请内测免费 API Key。</p>
            </div>
          </div>
        )}

        {/* DMXapi Host 设置与说明 */}
        {settings.provider === 'dmxapi' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              DMXapi Base URL
            </label>
            <input
              type="text"
              value={settings.host || ''}
              onChange={(e) => handleChange('host', e.target.value)}
              placeholder="https://www.DMXapi.com 或 /v1 或 /v1/chat/completions"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="text-xs text-gray-500 mt-2 space-y-1">
              <p>可填写：<span className="font-mono">https://www.DMXapi.com</span>、<span className="font-mono">https://www.DMXapi.com/v1</span>、或 <span className="font-mono">https://www.DMXapi.com/v1/chat/completions</span>，程序会自动识别。</p>
              <p>图片/多模态推荐模型：gpt-4o、gpt-4o-mini、gemini-1.5-flash、gemini-1.5-pro、claude-3 系列。</p>
            </div>
          </div>
        )}

        {/* API 密钥 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            API 密钥
          </label>
          <div className="relative">
            <input
              type={showApiKey ? 'text' : 'password'}
              value={settings.apiKey}
              onChange={(e) => handleChange('apiKey', e.target.value)}
              placeholder="输入 API 密钥"
              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => setShowApiKey(!showApiKey)}
              className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
            >
              {showApiKey ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
          <div className="flex items-center gap-3 mt-2">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testState.status === 'testing'}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded disabled:opacity-50"
            >
              {testState.status === 'testing' ? '正在测试...' : '测试连接'}
            </button>
            {testState.status === 'success' && (
              <span className="text-green-600 text-sm">连接正常（{Math.round(testState.latency || 0)} ms）</span>
            )}
            {testState.status === 'error' && (
              <span className="text-red-600 text-sm">连接失败：{testState.message}</span>
            )}
          </div>
        </div>

        {/* 模型选择 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            模型
          </label>
          <select
            value={settings.model}
            onChange={(e) => handleChange('model', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">选择模型</option>
            {availableModels.map(model => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </select>
        </div>

        {/* 温度设置 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            温度 (Temperature): {settings.temperature}
          </label>
          <input
            type="range"
            min="0"
            max="2"
            step="0.1"
            value={settings.temperature}
            onChange={(e) => handleChange('temperature', parseFloat(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>保守 (0)</span>
            <span>平衡 (1)</span>
            <span>创造性 (2)</span>
          </div>
        </div>

        {/* 最大令牌数 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            最大令牌数
          </label>
          <input
            type="number"
            min="1"
            max="32000"
            value={settings.maxTokens}
            onChange={(e) => handleChange('maxTokens', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* 系统提示词 */}
        <div className="mb-4">
          <label className="block text.sm font-medium text-gray-700 mb-2">
            系统提示词
          </label>
          <textarea
            value={settings.systemPrompt}
            onChange={(e) => handleChange('systemPrompt', e.target.value)}
            placeholder="输入系统提示词，定义AI角色的行为和风格..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
          />
        </div>
      </div>
    </div>
  )
}