export default function TestPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">测试页面</h1>
        <p className="text-lg text-gray-600">如果你能看到这个页面，说明部署是成功的！</p>
        <p className="text-sm text-gray-500 mt-4">当前时间: {new Date().toLocaleString()}</p>
      </div>
    </div>
  )
}