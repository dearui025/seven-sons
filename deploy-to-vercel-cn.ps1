Write-Host "🚀 七儿子项目 - 国内一键部署指南" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green

# 检查项目状态
Write-Host "📋 检查项目配置..." -ForegroundColor Yellow
if (Test-Path "package.json") {
    Write-Host "✅ 项目配置文件正常" -ForegroundColor Green
} else {
    Write-Host "❌ 未找到package.json，请检查项目路径" -ForegroundColor Red
    exit 1
}

# 显示部署步骤
Write-Host ""
Write-Host "🎯 部署步骤:" -ForegroundColor Cyan
Write-Host "1. 访问 https://vercel.com.cn" -ForegroundColor White
Write-Host "2. 使用GitHub/GitLab账号登录" -ForegroundColor White
Write-Host "3. 点击'New Project'" -ForegroundColor White
Write-Host "4. 导入你的Git仓库" -ForegroundColor White
Write-Host "5. 配置部署设置:" -ForegroundColor White
Write-Host "   - 框架: Next.js (自动检测)" -ForegroundColor White
Write-Host "   - 根目录: seven-sons" -ForegroundColor White
Write-Host "   - 构建命令: npm run build" -ForegroundColor White
Write-Host "6. 添加环境变量:" -ForegroundColor White
Write-Host "   - NEXT_PUBLIC_SUPABASE_URL" -ForegroundColor White
Write-Host "   - NEXT_PUBLIC_SUPABASE_ANON_KEY" -ForegroundColor White
Write-Host "   - SUPABASE_SERVICE_ROLE_KEY" -ForegroundColor White
Write-Host "7. 点击'Deploy'" -ForegroundColor White

Write-Host ""
Write-Host "🌐 备选国内平台:" -ForegroundColor Cyan
Write-Host "- 腾讯云云开发: https://cloud.tencent.com/product/tcb" -ForegroundColor White
Write-Host "- 阿里云函数计算: https://www.aliyun.com/product/fc" -ForegroundColor White
Write-Host "- 华为云函数工作流: https://www.huaweicloud.com/product/functiongraph.html" -ForegroundColor White

Write-Host ""
Write-Host "✅ 项目技术栈确认:" -ForegroundColor Green
Write-Host "- 框架: Next.js 15.5.6" -ForegroundColor White
Write-Host "- 数据库: Supabase" -ForegroundColor White
Write-Host "- UI组件: Radix UI + Tailwind CSS" -ForegroundColor White
Write-Host "- 实时通信: Socket.io" -ForegroundColor White
Write-Host "- AI集成: Anthropic Claude API" -ForegroundColor White

Write-Host ""
Write-Host "📞 技术支持:" -ForegroundColor Cyan
Write-Host "- 如遇部署问题，可查看项目根目录的部署文档" -ForegroundColor White
Write-Host "- 或联系项目维护人员" -ForegroundColor White

Write-Host ""
Write-Host "🎉 部署准备完成！请按照上述步骤操作即可一键部署。" -ForegroundColor Green