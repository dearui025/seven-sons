# 7个儿子 (Seven Sons) - AI智能助手平台

一个包含七个AI角色的互动平台，每个AI角色可以根据用户需求进行角色扮演、对话、生成内容，并且能够自动学习和模仿特定人物或风格。

## 🌟 特色功能

- **7个独特AI角色**: 李白、孙悟空、诸葛亮、林黛玉、墨子、庄子、鲁班
- **个性化学习**: 每个AI角色根据其背景自动学习和提升
- **实时对话**: 支持与AI角色进行实时聊天交互
- **任务管理**: 分配任务给不同AI角色，跟踪进度
- **群聊协作**: 多个AI角色协同工作
- **用户认证**: 安全的用户注册和登录系统

## 🛠 技术栈

### 前端
- **Next.js 14** - React框架，支持SSR
- **TypeScript** - 类型安全
- **Tailwind CSS** - 现代CSS框架
- **Lucide React** - 图标库

### 后端
- **Supabase** - 后端即服务
- **PostgreSQL** - 数据库
- **Supabase Auth** - 用户认证
- **Supabase Realtime** - 实时功能

### AI集成
- **OpenAI API** - GPT模型
- **Anthropic Claude** - 备选AI模型

## 🚀 快速开始

### 1. 环境要求

- Node.js 18+ 
- npm 或 yarn
- Supabase账户

### 2. 安装依赖

```bash
npm install
```

### 3. 环境配置

创建 `.env.local` 文件并配置以下环境变量：

```env
# Supabase配置
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# AI模型API密钥
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key

# 应用配置
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. 数据库设置

#### 方法一：使用Supabase Dashboard

1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 创建新项目
3. 在SQL编辑器中执行 `supabase/migrations/001_initial_schema.sql`
4. 执行 `supabase/migrations/002_insert_default_ai_roles.sql`

#### 方法二：使用本地Supabase CLI（推荐）

```bash
# 安装Supabase CLI
npm install -g supabase

# 初始化Supabase
supabase init

# 启动本地开发环境
supabase start

# 应用迁移
supabase db reset
```

### 5. 运行开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 📁 项目结构

```
seven-sons/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── page.tsx        # 主页
│   │   └── layout.tsx      # 根布局
│   ├── components/         # React组件
│   ├── lib/               # 工具库
│   │   ├── supabase.ts    # Supabase客户端
│   │   ├── database-setup.ts # 数据库初始化
│   │   └── utils.ts       # 通用工具
│   └── types/             # TypeScript类型定义
│       └── ai-roles.ts    # AI角色类型
├── public/
│   └── avatars/           # AI角色头像
├── supabase/
│   ├── migrations/        # 数据库迁移文件
│   └── config.toml       # Supabase配置
├── scripts/
│   └── setup-database.js # 数据库设置脚本
└── README.md
```

## 🎭 AI角色介绍

### 1. 李白 - 诗仙
- **专长**: 古诗词创作、文学鉴赏
- **个性**: 豪放不羁，想象力丰富
- **风格**: 古典诗意，文言与白话结合

### 2. 孙悟空 - 齐天大圣
- **专长**: 武艺指导、问题解决
- **个性**: 机智幽默，勇敢无畏
- **风格**: 活泼生动，现代口语化

### 3. 诸葛亮 - 智圣
- **专长**: 战略规划、决策咨询
- **个性**: 智慧深邃，谋略过人
- **风格**: 条理清晰，文雅严谨

### 4. 林黛玉 - 才女
- **专长**: 诗词创作、情感表达
- **个性**: 敏感细腻，才华横溢
- **风格**: 诗意浪漫，优美典雅

### 5. 墨子 - 兼爱非攻
- **专长**: 逻辑思辨、道德哲学
- **个性**: 务实理性，关爱众生
- **风格**: 逻辑严密，朴实直接

### 6. 庄子 - 逍遥哲学
- **专长**: 哲学思辨、人生智慧
- **个性**: 超脱世俗，追求自由
- **风格**: 寓言哲理，形象生动

### 7. 鲁班 - 工匠祖师
- **专长**: 工程设计、技术创新
- **个性**: 心灵手巧，勤奋务实
- **风格**: 技术导向，专业详细

## 🔧 开发指南

### 添加新的AI角色

1. 在 `src/types/ai-roles.ts` 中添加角色数据
2. 创建角色头像SVG文件到 `public/avatars/`
3. 更新数据库迁移文件

### 自定义AI模型

1. 在 `src/lib/ai-models.ts` 中添加新的模型配置
2. 实现模型特定的API调用逻辑
3. 更新角色设置以支持新模型

## 🚀 部署

### Vercel部署（推荐）

1. 连接GitHub仓库到Vercel
2. 配置环境变量
3. 自动部署

### 其他平台

- **Netlify**: 支持Next.js
- **Railway**: 全栈应用部署
- **AWS/阿里云**: 自定义部署

## 🤝 贡献

欢迎提交Issue和Pull Request！

## 📄 许可证

MIT License

---

**7个儿子** - 让AI角色陪伴您的学习和创作之旅！ 🎭✨
