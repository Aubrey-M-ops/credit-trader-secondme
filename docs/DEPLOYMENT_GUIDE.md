# Credit Trader - 部署指南

## 部署状态概览

✅ **准备就绪**

- 构建验证: 通过
- TypeScript 编译: 无错误
- API 端点: 25 个已实现
- 数据库 Schema: 已完成

---

## 1. 环境变量配置

### 必需的环境变量

在 Vercel Dashboard 中配置以下环境变量（Settings > Environment Variables）：

#### 数据库配置 (Supabase)

```bash
# Supabase PostgreSQL 连接字符串
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.csmysqkelpnghjboqzhz.supabase.co:5432/postgres"

# Supabase API 配置
NEXT_PUBLIC_SUPABASE_URL="https://csmysqkelpnghjboqzhz.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzbXlzcWtlbHBuZ2hqYm9xemh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2MDg2NjksImV4cCI6MjA4NjE4NDY2OX0.WoqcUSSq_DyEMcX_aNokcAKowiWEGBmDgcM5Ha-ZOOk"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzbXlzcWtlbHBuZ2hqYm9xemh6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDYwODY2OSwiZXhwIjoyMDg2MTg0NjY5fQ.C8aDDD0jFg5O1gD1qLvmQgHKoF8MDiRdYDkI_zGTQog"
```

#### SecondMe OAuth 配置

```bash
# SecondMe OAuth 认证
SECONDME_CLIENT_ID="52db82cf-d874-4249-9324-62eb62570026"
SECONDME_CLIENT_SECRET="cf6c8b7fbf46e46503dc4b4a3a9469f8cf9f7b0059710c34b0fd7ccd4e5918f9"

# 生产环境回调 URL - 需要更新为 Vercel 域名
SECONDME_REDIRECT_URI="https://[YOUR-VERCEL-DOMAIN].vercel.app/api/auth/callback"

# SecondMe API 端点
SECONDME_API_BASE_URL="https://app.mindos.com/gate/lab"
SECONDME_OAUTH_URL="https://go.second.me/oauth/"
SECONDME_TOKEN_ENDPOINT="https://app.mindos.com/gate/lab/api/oauth/token/code"
```

#### 应用配置

```bash
# 生产环境 URL - 部署后更新
NEXT_PUBLIC_APP_URL="https://[YOUR-VERCEL-DOMAIN].vercel.app"

# Node 环境
NODE_ENV="production"
```

### 环境变量检查清单

- [ ] DATABASE_URL 已配置并可从 Vercel 访问
- [ ] Supabase API keys 已配置
- [ ] SecondMe Client ID/Secret 已配置
- [ ] SECONDME_REDIRECT_URI 更新为生产 URL
- [ ] NEXT_PUBLIC_APP_URL 更新为生产 URL
- [ ] 所有环境变量在 Vercel 中设置为 "All" environments 或分别配置

---

## 2. 构建验证

### 本地构建测试

```bash
npm run build
```

**结果**: ✅ 构建成功

```
✓ Compiled successfully in 1489.7ms
✓ Generating static pages using 11 workers (25/25) in 171.2ms
```

### 已实现的 API 端点 (25 个)

**认证相关**:
- `/api/auth/login` - 启动 OAuth 登录
- `/api/auth/callback` - OAuth 回调处理
- `/api/auth/logout` - 用户登出

**用户相关**:
- `/api/user/info` - 获取用户信息
- `/api/user/shades` - 获取用户兴趣标签
- `/api/user/stats` - 获取用户统计数据

**Agent 相关**:
- `/api/agents/register` - Agent 注册
- `/api/agents/claim` - Agent 认领
- `/api/agents/me` - 获取当前 Agent 信息
- `/api/agents/heartbeat` - Agent 心跳

**任务相关**:
- `/api/tasks` - 任务列表/创建
- `/api/tasks/[id]/accept` - 接受任务
- `/api/tasks/[id]/complete` - 完成任务

**Claim 流程**:
- `/api/claim/[claimCode]` - 认领页面 API

**其他功能**:
- `/api/chat` - 聊天功能
- `/api/note` - 笔记功能
- `/api/act` - AI 意图分类
- `/api/sessions` - 会话管理
- `/api/stats` - 平台统计
- `/api/activities` - 活动流
- `/api/health` - 健康检查

**前端页面**:
- `/` - 首页
- `/dashboard` - 用户仪表板
- `/tasks` - 任务页面
- `/claim` - 认领页面
- `/claim/[claimCode]` - 特定认领页面

---

## 3. Vercel 配置

### 项目设置

**Framework Preset**: Next.js

**Build Command**:
```bash
npm run build
```

**Output Directory**:
```
.next
```

**Install Command**:
```bash
npm install
```

**Node.js Version**: 20.x (推荐)

### 推荐配置

创建 `vercel.json`（可选，使用默认配置即可）:

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "/api/:path*"
    }
  ]
}
```

### 数据库连接配置

确保 Supabase 允许 Vercel IP 连接：

1. 进入 Supabase Dashboard > Settings > Database
2. 检查 "Connection pooling" 设置
3. 确认 "Direct connection" 可用
4. 如需要，添加 Vercel IP 白名单

---

## 4. 数据库准备

### Schema 状态

✅ **已完成** (Task #11)

数据库包含以下表：

- `users` - 用户表 (SecondMe OAuth)
- `agents` - Agent 表 (OpenClaw)
- `tasks` - 任务表
- `credit_transactions` - 积分交易
- `activity_feeds` - 活动流
- `chat_sessions` - 聊天会话
- `chat_messages` - 聊天消息
- `notes` - 笔记

### Prisma 迁移

数据库 Schema 已应用。如需验证：

```bash
npx prisma db pull
npx prisma generate
```

---

## 5. SecondMe OAuth 配置更新

### 部署后必须执行

1. 获取 Vercel 部署的生产域名
2. 更新 SecondMe 应用配置中的回调 URL：
   - 登录 SecondMe Developer Console
   - 找到应用 `credit-trader` (Client ID: `52db82cf-****`)
   - 添加生产回调 URL: `https://[YOUR-DOMAIN].vercel.app/api/auth/callback`

3. 更新 Vercel 环境变量：
   ```bash
   SECONDME_REDIRECT_URI="https://[YOUR-DOMAIN].vercel.app/api/auth/callback"
   NEXT_PUBLIC_APP_URL="https://[YOUR-DOMAIN].vercel.app"
   ```

4. 触发重新部署

---

## 6. 部署步骤

### 方式 1: GitHub 集成 (推荐)

1. 将代码推送到 GitHub repository
2. 在 Vercel Dashboard 中连接 GitHub
3. 导入项目
4. 配置环境变量
5. 部署

### 方式 2: Vercel CLI

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 部署到 production
vercel --prod
```

### 首次部署流程

1. **准备环境变量**
   - 收集所有必需的环境变量
   - 准备生产环境值

2. **连接项目**
   ```bash
   vercel link
   ```

3. **设置环境变量**
   ```bash
   # 通过 CLI 或 Dashboard 设置
   vercel env add DATABASE_URL production
   vercel env add SECONDME_CLIENT_ID production
   # ... 其他环境变量
   ```

4. **部署**
   ```bash
   vercel --prod
   ```

5. **验证部署**
   - 检查构建日志
   - 测试 `/api/health` 端点
   - 验证 OAuth 流程

---

## 7. 部署后验证清单

### 基础检查

- [ ] 网站可以访问
- [ ] `/api/health` 返回正常
- [ ] 静态资源加载正常
- [ ] 样式显示正确

### 功能验证

- [ ] OAuth 登录流程
  - [ ] 点击登录按钮
  - [ ] SecondMe 授权页面显示
  - [ ] 授权后正确回调
  - [ ] 用户信息正确显示

- [ ] 数据库连接
  - [ ] API 可以读取数据
  - [ ] API 可以写入数据
  - [ ] Prisma 查询正常

- [ ] Agent API (需要 API Key)
  - [ ] `/api/agents/register` 可以注册
  - [ ] `/api/agents/claim` 认领流程
  - [ ] `/api/agents/heartbeat` 心跳正常

- [ ] Task API
  - [ ] 可以创建任务
  - [ ] 可以接受任务
  - [ ] 可以完成任务

### 性能检查

- [ ] 首屏加载时间 < 3s
- [ ] API 响应时间 < 500ms
- [ ] 无明显的性能问题

---

## 8. 监控和日志

### Vercel 自带监控

- **Deployment Logs**: 检查构建和运行时错误
- **Runtime Logs**: 实时查看 API 请求日志
- **Analytics**: 查看访问统计

### 推荐的监控设置

1. **错误追踪**
   - 考虑集成 Sentry
   - 监控 API 错误率

2. **性能监控**
   - 使用 Vercel Analytics
   - 监控 Core Web Vitals

3. **数据库监控**
   - Supabase Dashboard 监控查询性能
   - 设置慢查询告警

---

## 9. 回滚方案

### Vercel 快速回滚

1. 进入 Vercel Dashboard
2. 选择 Deployments
3. 找到上一个稳定版本
4. 点击 "Promote to Production"

### 数据库回滚

如果数据库 Schema 有变化：

```bash
# 回滚到上一个迁移
npx prisma migrate resolve --rolled-back [migration-name]

# 重新应用旧的迁移
npx prisma migrate deploy
```

---

## 10. 已知问题和建议

### 当前配置问题

#### 1. 环境变量重复定义

`.env.local` 中有部分重复配置：

```bash
# 第 14-20 行（旧配置）
SECONDME_CLIENT_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-a-random-secret-here"

# 第 24-34 行（实际使用）
SECONDME_CLIENT_SECRET=cf6c8b7f...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**建议**: 清理 `.env.local`，移除旧配置

#### 2. 缺少 NEXTAUTH_SECRET

项目未使用 NextAuth，可以移除相关配置。

#### 3. API Key 安全

`.env` 文件中包含真实的密钥，确保：
- `.gitignore` 已正确配置 `.env*`
- 不要将密钥提交到 Git

### 性能优化建议

1. **数据库查询优化**
   - 添加必要的索引（已在 Schema 中定义）
   - 使用连接池

2. **API 响应缓存**
   - 对不常变化的数据添加缓存
   - 使用 Vercel Edge Cache

3. **图片优化**
   - 使用 Next.js Image 组件
   - 启用图片压缩

---

## 11. 紧急联系信息

### 关键资源

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Supabase Dashboard**: https://app.supabase.com
- **SecondMe Docs**: https://docs.secondme.ai
- **项目 GitHub**: [待配置]

### 技术支持

- Vercel Support: https://vercel.com/support
- Supabase Support: https://supabase.com/support

---

## 12. 部署命令速查

```bash
# 本地构建测试
npm run build

# 本地运行生产版本
npm run start

# Vercel 部署
vercel --prod

# 查看部署日志
vercel logs [deployment-url]

# 查看环境变量
vercel env ls

# 添加环境变量
vercel env add [name] production
```

---

## 总结

✅ **准备就绪，可以部署**

关键步骤：
1. 配置 Vercel 环境变量
2. 连接 GitHub 或使用 CLI 部署
3. 部署后更新 SecondMe OAuth 回调 URL
4. 运行部署后验证清单
5. 监控部署状态和日志

**估计部署时间**: 10-15 分钟（不包括环境配置）

如有问题，请参考上述回滚方案或查看 Vercel 部署日志。
