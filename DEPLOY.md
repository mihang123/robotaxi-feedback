# 🚀 部署指南

## 方案 A: 使用 SQLite + Vercel（演示模式，数据只读）

如果只需要展示功能，不涉及写入，可以使用 SQLite：

1. 推送代码到 GitHub
2. 在 Vercel 导入仓库
3. 环境变量配置：
   ```
   DATABASE_URL=file:./prisma/dev.db
   OPENAI_API_KEY=sk-your-key-here
   ```
4. 部署

---

## 方案 B: 使用 PostgreSQL（推荐，完整功能）

### 1. 创建 PostgreSQL 数据库

推荐使用 **Neon.tech**（免费版）：
- 访问 https://neon.tech
- 注册账号并创建免费数据库
- 复制连接字符串（格式：`postgresql://...`）

### 2. 修改 Prisma 配置

编辑 `schema.prisma`，将 SQLite 改为 PostgreSQL：

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### 3. 提交并推送更改

```bash
git add schema.prisma
git commit -m "Change to PostgreSQL for Vercel"
git push
```

### 4. Vercel 部署

1. 在 Vercel 导入仓库
2. 添加环境变量：
   ```
   DATABASE_URL=postgresql://your-neon-connection-string
   OPENAI_API_KEY=sk-your-openai-key
   ```
3. 点击 Deploy

### 5. 运行数据库迁移和种子数据

部署成功后，在本地终端运行：

```bash
# 设置环境变量为你的 Neon 连接串
export DATABASE_URL="postgresql://your-neon-connection-string"

# 运行迁移
npx prisma migrate deploy

# 生成种子数据
npm run db:seed
```

---

## 本地开发预览（已就绪）

当前状态：
- ✅ 开发服务器可启动：`npm run dev`
- ✅ 生产构建通过：`npm run build`
- ✅ 数据库已初始化（120条数据）
- ✅ 所有功能完整可用

访问：**http://localhost:3000**
