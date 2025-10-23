import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '用户认证 - 七个儿子',
  description: '登录或注册您的账户',
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="flex min-h-screen">
        {/* 左侧装饰区域 */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative z-10 flex flex-col justify-center items-center text-white p-12">
            <div className="max-w-md text-center">
              <h1 className="text-4xl font-bold mb-6">欢迎来到七个儿子</h1>
              <p className="text-xl mb-8 text-blue-100">
                智能AI助手平台，与七位AI角色互动
              </p>
              <div className="space-y-4 text-left">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
                  <span className="text-blue-100">七位独特AI角色</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-300 rounded-full"></div>
                  <span className="text-blue-100">智能对话互动</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-indigo-300 rounded-full"></div>
                  <span className="text-blue-100">个性化学习成长</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* 装饰性几何图形 */}
          <div className="absolute top-20 right-20 w-32 h-32 border border-white/20 rounded-full"></div>
          <div className="absolute bottom-20 left-20 w-24 h-24 border border-white/20 rounded-full"></div>
          <div className="absolute top-1/2 left-1/4 w-16 h-16 border border-white/20 rounded-full"></div>
        </div>

        {/* 右侧认证表单区域 */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}