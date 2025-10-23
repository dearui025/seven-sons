# Git集成部署完整指南

## 🚀 Git集成部署方案

由于Vercel CLI上传限制，我们使用Git集成部署来避开文件数量限制。

## 第一步：安装Git

### 方法1：下载Git官方安装包（推荐）
1. 访问 [Git官网](https://git-scm.com/download/win)
2. 下载Windows版本的Git安装包
3. 运行安装程序，使用默认设置即可
4. 安装完成后重启PowerShell

### 方法2：使用浏览器下载
如果无法访问官网，可以搜索"Git Windows下载"获取安装包。

## 第二步：验证Git安装

安装完成后，在PowerShell中运行：
```bash
git --version
```

应该显示Git版本信息。

## 第三步：初始化Git仓库

在项目根目录（`C:\Users\Administrator\Desktop\7个儿子`）运行：

```bash
# 初始化Git仓库
git init

# 配置用户信息（首次使用Git需要）
git config --global user.name "您的用户名"
git config --global user.email "您的邮箱"
```

## 第四步：创建.gitignore文件

我已经为您优化了`.gitignore`文件，它会排除：
- node_modules
- .next构建文件
- 环境变量文件
- IDE配置文件
- 临时文件

## 第五步：添加文件并提交

```bash
# 添加所有文件到Git
git add .

# 创建初始提交
git commit -m "Initial commit: Seven Sons AI Chat Application"
```

## 第六步：推送到远程仓库

### 选择Git托管平台：

#### 选项A：GitHub（推荐）
1. 访问 [GitHub](https://github.com)
2. 登录或注册账户
3. 点击右上角"+"，选择"New repository"
4. 仓库名称：`seven-sons`
5. 设置为Public或Private
6. **不要**勾选"Initialize this repository with a README"
7. 点击"Create repository"

#### 选项B：GitLab
1. 访问 [GitLab](https://gitlab.com)
2. 创建新项目
3. 选择"Create blank project"

### 连接远程仓库：

以GitHub为例：
```bash
# 添加远程仓库（替换为您的仓库URL）
git remote add origin https://github.com/您的用户名/seven-sons.git

# 推送代码
git branch -M main
git push -u origin main
```

## 第七步：在Vercel Dashboard连接仓库

### 1. 登录Vercel Dashboard
- 访问 [Vercel Dashboard](https://vercel.com/dashboard)
- 使用您的账户登录

### 2. 导入项目
- 点击"Add New..." → "Project"
- 选择"Import Git Repository"
- 如果是首次使用，需要连接GitHub/GitLab账户

### 3. 选择仓库
- 在仓库列表中找到`seven-sons`
- 点击"Import"

### 4. 配置项目设置
- **Project Name**: `seven-sons`
- **Framework Preset**: `Next.js`
- **Root Directory**: 选择`seven-sons`（重要！）
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### 5. 配置环境变量
在"Environment Variables"部分添加：
```
NEXT_PUBLIC_SUPABASE_URL=https://hqjxjsoiqtjgrbscckez.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhxanhqc29pcXRqZ3Jic2Nja2V6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA5Mjk5OTIsImV4cCI6MjA3NjUwNTk5Mn0.pXB5cQD52pJR8awvA-jSvtbQwy1RKG2HhEekYmXHGoI
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhxanhqc29pcXRqZ3Jic2Nja2V6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDkyOTk5MiwiZXhwIjoyMDc2NTA1OTkyfQ.O7AOUdtZUhHWZ__59OScEPyW9CElA1ENdkZjs408AGo
```

### 6. 部署
- 点击"Deploy"
- 等待构建完成（通常需要2-5分钟）

## 第八步：验证部署

部署完成后：
1. 访问提供的URL（如：`https://seven-sons-xxx.vercel.app`）
2. 测试应用功能
3. 检查数据库连接是否正常

## 🔄 后续更新流程

每次更新代码后：
```bash
# 添加更改
git add .

# 提交更改
git commit -m "描述您的更改"

# 推送到远程仓库
git push origin main
```

Vercel会自动检测到推送并重新部署！

## ⚠️ 重要提示

1. **Root Directory设置**：确保在Vercel中设置Root Directory为`seven-sons`
2. **环境变量**：必须在Vercel Dashboard中配置环境变量
3. **分支保护**：建议设置main分支为默认分支
4. **自动部署**：每次推送到main分支都会触发自动部署

## 🆘 常见问题

### Q: 构建失败怎么办？
A: 检查Vercel构建日志，通常是环境变量或依赖问题

### Q: 数据库连接失败？
A: 确认环境变量在Vercel中正确配置

### Q: 404错误？
A: 检查Root Directory是否设置为`seven-sons`

## 📞 需要帮助？

如果遇到任何问题，请提供：
1. 错误信息截图
2. Vercel构建日志
3. 具体的错误步骤

这样我可以更好地帮助您解决问题！