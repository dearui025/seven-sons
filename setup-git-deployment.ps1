# Git集成部署设置脚本
# 请先安装Git后运行此脚本

Write-Host "🚀 开始设置Git集成部署..." -ForegroundColor Green

# 检查Git是否安装
try {
    $gitVersion = git --version
    Write-Host "✅ Git已安装: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Git未安装，请先安装Git:" -ForegroundColor Red
    Write-Host "   1. 访问 https://git-scm.com/download/win" -ForegroundColor Yellow
    Write-Host "   2. 下载并安装Git" -ForegroundColor Yellow
    Write-Host "   3. 重启PowerShell后重新运行此脚本" -ForegroundColor Yellow
    exit 1
}

# 检查是否已经是Git仓库
if (Test-Path ".git") {
    Write-Host "✅ Git仓库已存在" -ForegroundColor Green
} else {
    Write-Host "📦 初始化Git仓库..." -ForegroundColor Blue
    git init
    Write-Host "✅ Git仓库初始化完成" -ForegroundColor Green
}

# 检查Git配置
$userName = git config --global user.name
$userEmail = git config --global user.email

if (-not $userName -or -not $userEmail) {
    Write-Host "⚙️ 需要配置Git用户信息" -ForegroundColor Yellow
    $inputName = Read-Host "请输入您的用户名"
    $inputEmail = Read-Host "请输入您的邮箱"
    
    git config --global user.name "$inputName"
    git config --global user.email "$inputEmail"
    Write-Host "✅ Git用户信息配置完成" -ForegroundColor Green
} else {
    Write-Host "✅ Git用户信息已配置: $userName <$userEmail>" -ForegroundColor Green
}

# 添加文件到Git
Write-Host "📁 添加文件到Git..." -ForegroundColor Blue
git add .

# 检查是否有文件需要提交
$status = git status --porcelain
if ($status) {
    Write-Host "💾 创建初始提交..." -ForegroundColor Blue
    git commit -m "Initial commit: Seven Sons AI Chat Application"
    Write-Host "✅ 初始提交完成" -ForegroundColor Green
} else {
    Write-Host "✅ 没有新文件需要提交" -ForegroundColor Green
}

Write-Host ""
Write-Host "🎉 Git仓库设置完成！" -ForegroundColor Green
Write-Host ""
Write-Host "📋 下一步操作:" -ForegroundColor Yellow
Write-Host "1. 在GitHub/GitLab创建新仓库" -ForegroundColor White
Write-Host "2. 复制仓库URL" -ForegroundColor White
Write-Host "3. 运行以下命令连接远程仓库:" -ForegroundColor White
Write-Host "   git remote add origin <您的仓库URL>" -ForegroundColor Cyan
Write-Host "   git branch -M main" -ForegroundColor Cyan
Write-Host "   git push -u origin main" -ForegroundColor Cyan
Write-Host ""
Write-Host "4. 在Vercel Dashboard导入项目" -ForegroundColor White
Write-Host "   - 设置Root Directory为: seven-sons" -ForegroundColor Cyan
Write-Host "   - 配置环境变量" -ForegroundColor Cyan
Write-Host ""
Write-Host "📖 详细步骤请查看: git-deployment-guide.md" -ForegroundColor Yellow