# 🚗 Robotaxi 乘客反馈管理平台

滴滴自动驾驶内部工具，用于管理和分析 Robotaxi 乘客反馈数据，集成 GPT-4 智能分析能力。

## ✨ 功能特性

- **数据仪表盘** — 核心 KPI 卡片 + 30天趋势图 + 多维分布图表
- **反馈列表** — 多条件筛选（评分/城市/路线/类别/情感/日期）+ 分页表格 + 详情抽屉
- **AI 分析** — GPT-4 单条分析、批量摘要生成、产品优化建议

## 🛠 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | Next.js 14 (App Router) + TypeScript + Tailwind CSS |
| 图表 | Recharts (ComposedChart, PieChart, BarChart) |
| 后端 | Next.js API Routes (Serverless) |
| 数据库 | SQLite via Prisma ORM |
| AI | OpenAI GPT-4o-mini API |
| 部署 | Vercel |

## 📁 项目结构

```
├── app/
│   ├── page.tsx                  # 仪表盘
│   ├── feedback/page.tsx         # 反馈列表
│   ├── ai-analysis/page.tsx      # AI 分析
│   └── api/
│       ├── feedback/             # 反馈 CRUD
│       ├── stats/overview        # KPI 统计
│       ├── stats/trends          # 趋势数据
│       ├── stats/distribution    # 分布数据
│       └── ai/                   # AI 分析接口
├── components/
│   ├── Dashboard/                # 仪表盘组件
│   ├── Feedback/                 # 反馈相关组件
│   ├── AI/                       # AI 分析组件
│   └── layout/                   # 布局组件
├── prisma/
│   ├── schema.prisma             # 数据库模型
│   └── seed.ts                   # 120+ 条模拟数据
├── lib/
│   ├── prisma.ts                 # Prisma 客户端
│   ├── openai.ts                 # OpenAI 客户端
│   └── utils.ts                  # 工具函数
└── types/index.ts                # TypeScript 类型定义
```

## 🚀 本地启动

### 1. 克隆项目

```bash
git clone <your-repo-url>
cd robotaxi-feedback-platform
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

```bash
cp .env.example .env.local
```

编辑 `.env.local`：

```env
DATABASE_URL="file:./dev.db"
OPENAI_API_KEY="sk-your-openai-api-key"   # 从 https://platform.openai.com 获取
```

> **注意**：不配置 OpenAI Key 也可以运行，AI 功能会返回预设的演示数据。

### 4. 初始化数据库

```bash
npx prisma migrate dev --name init
npx prisma db seed
```

数据库将生成 **120 条**覆盖北京/上海/深圳三座城市的真实场景反馈数据。

### 5. 启动开发服务器

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看效果。

---

## ☁️ 部署到 Vercel

> **注意**：Vercel Serverless 环境不支持 SQLite 文件写入。生产部署需将数据库切换为 PostgreSQL（推荐 Neon 或 Supabase 免费套餐）。

### 使用 PostgreSQL 部署

1. 在 [Neon.tech](https://neon.tech) 创建免费 PostgreSQL 数据库，获取连接字符串
2. 修改 `prisma/schema.prisma`：

```prisma
datasource db {
  provider = "postgresql"    // 改这里
  url      = env("DATABASE_URL")
}
```

3. 推送代码到 GitHub
4. 在 Vercel 导入仓库，添加环境变量：
   - `DATABASE_URL` = PostgreSQL 连接串
   - `OPENAI_API_KEY` = 你的 OpenAI Key
5. 部署后运行数据库迁移：
   ```bash
   npx prisma migrate deploy
   npx prisma db seed
   ```

---

## 📊 数据说明

种子数据覆盖以下场景：

| 维度 | 内容 |
|------|------|
| **城市** | 北京、上海、深圳 |
| **路线** | 每城市 5 条典型路线（共 15 条） |
| **类别** | 行驶体验、车内环境、接驾体验、路线规划、安全感受、其他 |
| **评分分布** | 5星≈30%，4星≈25%，3星≈20%，2星≈15%，1星≈10% |
| **时间跨度** | 最近 30 天 |

## 🔑 常用命令

```bash
npm run dev          # 启动开发服务器
npm run build        # 构建生产版本
npm run db:studio    # 打开 Prisma Studio 可视化数据库
npm run db:reset     # 重置并重新生成模拟数据
```

## 📝 License

MIT
