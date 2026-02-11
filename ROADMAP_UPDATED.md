# Agent 劳动力市场 - 更新后的开发路线图

**当前状态**: Next.js + SecondMe OAuth 已完成 ✅
**项目目录**: `/Users/wangruobing/Personal/hackathon/credit-trader-secondme`
**剩余时间**: 2026-02-09 下午 → 2026-02-12 中午 (3.5 天)

---

## ✅ 已完成部分

### Phase 1: 基础设施 (已完成)

- ✅ Next.js 项目创建 (`credit-trader-secondme`)
- ✅ Prisma 配置完成
- ✅ 基础 User 表结构 (包含 SecondMe OAuth 字段)
- ✅ ChatSession, ChatMessage, Note 表

### Phase 2: SecondMe OAuth (已完成)

- ✅ OAuth 登录流程 (`/api/auth/login`, `/api/auth/callback`, `/api/auth/logout`)
- ✅ 用户信息获取 (`/api/secondme/user/info`, `/api/user/shades`)
- ✅ Chat API 集成 (`/api/chat`)
- ✅ Act API 集成 (`/api/act`)
- ✅ Note API 集成 (`/api/note`)
- ✅ Dashboard 页面 (`/dashboard`)
- ✅ 登录按钮组件 (`LoginButton`)
- ✅ 用户资料组件 (`UserProfile`)
- ✅ 聊天窗口组件 (`ChatWindow`)

---

## 🎯 接下来要做的事情

### Step 1: 配置 Supabase 数据库 (优先级 P0)

**时间**: 1 小时
**目标**: 连接 Supabase PostgreSQL 数据库

#### 1.1 创建 Supabase 项目 (15 分钟)

1. 访问 https://supabase.com/
2. 创建新项目: `agent-labor-market`
3. 选择区域 (推荐: Singapore 或 Tokyo)
4. 等待初始化完成

#### 1.2 获取数据库连接信息 (5 分钟)

在 Supabase Dashboard:

- Settings → Database → Connection string
- 复制 URI 格式的连接字符串
- Settings → API → 获取 Project URL 和 Keys

#### 1.3 扩展 Prisma Schema (20 分钟)

修改 `prisma/schema.prisma`,添加 Agent 劳动力市场需要的表:

**扩展 User 表**

- 添加钱包字段：balance（余额）、totalEarned（总收入）、totalSpent（总支出）
- 添加统计字段：completedTasks（完成任务数）、rating（评分）、status（状态）
- 添加任务关系：publishedTasks（发布的任务）、workerTasks（接单的任务）

**新增 Task 表**

- 任务基本信息：title、description、estimatedTokens、budgetRmb
- 任务状态：open、accepted、executing、completed、cancelled
- 关联用户：publisher（发布者）、worker（执行者）
- 执行结果：result、rating
- 时间戳：createdAt、updatedAt、completedAt、deadline

**新增 Execution 表**

- 执行记录：taskId、workerId、status、tokensUsed
- 执行结果：result、error
- 时间戳：startedAt、completedAt

**新增 Transaction 表**

- 交易信息：executionId、fromAgentId、toAgentId
- 金额信息：amountRmb、tokensTransferred
- 交易状态：pending、completed、failed、refunded

**新增 Rating 表**

- 评分信息：transactionId、raterId、rateeId、score、comment

#### 1.4 配置环境变量 (10 分钟)

在 `.env.local` 中添加 Supabase 配置:

- DATABASE_URL（Supabase PostgreSQL 连接字符串）
- NEXT_PUBLIC_SUPABASE_URL（Supabase 项目 URL）
- NEXT_PUBLIC_SUPABASE_ANON_KEY（匿名密钥）
- SUPABASE_SERVICE_ROLE_KEY（服务角色密钥）

保持现有的 SecondMe OAuth 配置不变。

#### 1.5 推送数据库 Schema (10 分钟)

执行 Prisma 命令推送 schema 到 Supabase 并生成 Prisma Client。

**验收标准**:

- ✅ Supabase 项目创建成功
- ✅ 数据库表创建成功 (9 张表: users, chat_sessions, chat_messages, notes, tasks, executions, transactions, ratings)
- ✅ Prisma Client 生成成功
- ✅ 本地可以连接数据库

---

### Step 2: 配置 CI/CD 和部署 (优先级 P0)

**时间**: 1 小时
**目标**: 配置 GitHub Actions 和部署到 Vercel

#### 2.1 配置 GitHub Actions (20 分钟)

**创建 CI Workflow** - `.github/workflows/ci.yml`

- 自动化代码检查：Lint、Type Check、Build 验证
- 触发时机：每次 Push 和 Pull Request
- 运行环境：Node.js 20.x
- 包含 Prisma Client 生成步骤

**创建 PR Check Workflow** - `.github/workflows/pr-check.yml`

- PR 专用检查流程
- 添加检查状态徽章
- 确保代码质量后才能合并

**创建 Deploy Workflow** - `.github/workflows/deploy.yml`（可选）

- 推送到 main 分支时触发
- 自动触发 Vercel 部署
- 发送部署通知

#### 2.3 配置 GitHub Secrets (5 分钟)

在 GitHub 仓库设置中添加:

- Settings → Secrets and variables → Actions
- 添加必要的密钥（用于部署通知等）

#### 2.4 部署到 Vercel (15 分钟)

1. 访问 https://vercel.com/
2. Import Git Repository
3. 选择 `credit-trader-secondme` 仓库
4. 配置环境变量 (复制 `.env.local` 的所有内容):
   - `SECONDME_CLIENT_ID`
   - `SECONDME_CLIENT_SECRET`
   - `SECONDME_REDIRECT_URI`
   - `DATABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - 等其他环境变量
5. 添加 Build Command: `npx prisma generate && npm run build`
6. Deploy

#### 2.5 更新 SecondMe Redirect URI (5 分钟)

在 SecondMe 开发者平台添加:

- `https://[your-vercel-domain].vercel.app/api/auth/callback`

#### 2.6 验证部署和 CI/CD (5 分钟)

- ✅ GitHub Actions 运行成功（查看 Actions 标签页）
- ✅ 访问 Vercel 部署 URL
- ✅ 测试登录流程
- ✅ 检查 `/api/secondme/user/info` 是否正常
- ✅ 创建测试 PR 验证 CI 流程

**验收标准**:

- ✅ GitHub Actions CI/CD 配置完成
- ✅ 所有检查通过（Lint、Type Check、Build）
- ✅ 项目成功部署到 Vercel
- ✅ 生产环境可以访问
- ✅ OAuth 登录在生产环境正常工作
- ✅ PR 检查自动运行

---

### Step 3: 实现任务管理功能 (优先级 P1)

**时间**: Day 1 下午 + Day 2 上午 (6 小时)

#### 3.1 任务发布功能 (2 小时)

**创建发布页面** - `src/app/publish/page.tsx`

- 任务发布表单（标题、描述、预计 tokens、报酬、截止时间）
- 表单验证和提交逻辑
- 发布成功后跳转到任务详情页

**创建发布 API** - `src/app/api/tasks/route.ts`

- POST 端点：创建新任务
  - 验证用户登录状态
  - 验证必填字段
  - 保存任务到数据库
  - 返回任务 ID
- GET 端点：获取任务列表
  - 支持按状态筛选
  - 支持分页
  - 按报酬排序
  - 返回任务列表和分页信息

**验收标准**:

- ✅ 可以访问 `/publish` 页面
- ✅ 可以提交任务表单
- ✅ 任务保存到数据库
- ✅ 发布后跳转到任务详情

---

#### 3.2 任务市场页面 (2 小时)

**创建市场页面** - `src/app/market/page.tsx`

- 显示所有待接任务（status=open）
- 任务卡片展示：
  - 任务标题和报酬（突出显示）
  - 任务描述（截断显示）
  - 发布者信息（头像、名称）
  - 预计 tokens 数量
- 点击任务卡片跳转到详情页
- 显示"发布任务"按钮
- 加载状态和空状态处理

**验收标准**:

- ✅ 可以访问 `/market` 页面
- ✅ 显示所有待接任务
- ✅ 按报酬排序
- ✅ 点击任务可以跳转到详情

---

#### 3.3 任务详情 & 接单 (2 小时)

**创建详情页面** - `src/app/tasks/[id]/page.tsx`

- 显示完整任务信息
- 显示发布者信息
- 显示任务状态
- 接单按钮（仅对非发布者显示）

**创建详情 API** - `src/app/api/tasks/[id]/route.ts`

- GET 端点：获取任务详情
- 包含发布者和执行者信息
- 包含执行记录

**创建接单 API** - `src/app/api/tasks/[id]/accept/route.ts`

- POST 端点：接单操作
- 验证用户不是发布者
- 更新任务状态为 accepted
- 设置 workerId

**验收标准**:

- ✅ 可以查看任务详情
- ✅ 可以点击接单按钮
- ✅ 接单后任务状态更新

---

### Step 4: 实现核心 A2A 功能 (优先级 P1)

**时间**: Day 2 下午 + Day 3 上午 (8 小时)

#### 4.1 自动匹配 (3 小时)

- 使用 SecondMe Act API
- 让 Agent 评估任务是否匹配
- 选择最佳 Agent

#### 4.2 自动执行 (3 小时)

- 使用 SecondMe Chat API 或 Claude CLI
- 执行任务
- 保存结果

#### 4.3 自动验收 & 结算 (2 小时)

- 使用 SecondMe Act API 评价结果
- 积分结算
- 交易记录

---

### Step 5: 数据展示 (优先级 P2)

**时间**: Day 3 下午 (4 小时)

#### 5.1 扩展 Dashboard

- 显示余额
- 显示我的任务
- 显示交易历史

#### 5.2 排行榜

- Top 10 收入
- Top 10 完成数

---

### Step 6: 最后冲刺 (优先级 P0)

**时间**: Day 4 上午 (6 小时)

- UI 打磨
- 测试修复
- 准备 Demo
- 提交项目

---

## 时间分配总结

| 任务                  | 时间       | 完成日期                |
| --------------------- | ---------- | ----------------------- |
| ✅ Next.js + OAuth    | 已完成     | -                       |
| Step 1: Supabase 配置 | 1h         | Day 1 下午              |
| Step 2: Vercel 部署   | 45min      | Day 1 下午              |
| Step 3: 任务管理      | 6h         | Day 1 晚 + Day 2 上午   |
| Step 4: A2A 功能      | 8h         | Day 2 下午 + Day 3 上午 |
| Step 5: 数据展示      | 4h         | Day 3 下午              |
| Step 6: 最后冲刺      | 6h         | Day 4 上午              |
| **总计**              | **25.75h** |                         |

---

## 下一步立即行动

**现在就开始 Step 1**:

1. 创建 Supabase 项目
2. 扩展 Prisma Schema
3. 推送数据库

准备好后告诉我,我会帮你完成每一步! 🚀
