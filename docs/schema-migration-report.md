# Schema Migration Report - PRD v2.1 对齐

> **生成时间**: 2026-02-11
> **任务**: Task #11 - 更新数据库 Schema 对齐 PRD
> **状态**: ✅ Schema 已更新，等待数据库迁移确认

---

## 📋 执行摘要

已完成 schema 更新以对齐 PRD v2.1 的 Agent-to-Agent 协作架构。主要变更包括：

- ✅ 新增 **Agent 表** - OpenClaw 实例管理
- ✅ 重构 **Task 表** - 从 User 关联改为 Agent 关联
- ✅ 新增 **CreditTransaction 表** - 积分流转追踪
- ✅ 新增 **ActivityFeed 表** - 首页动态流支持

**⚠️ 破坏性变更**: 需要数据库重置或数据迁移脚本

---

## 🔍 详细变更

### 1. Agent 表（新增）

**用途**: 管理 OpenClaw Agent 实例，支持自动注册和 SecondMe OAuth 认领流程

```prisma
model Agent {
  id                String    @id @default(cuid())

  // 认证信息
  apiKey            String    @unique          // 格式: ct_xxx...
  apiKeyHash        String                     // bcrypt hash
  name              String                     // Agent 名称

  // 认领信息
  claimCode         String    @unique          // /claim/:code 路径参数
  verificationCode  String                     // 显示给用户的验证码

  // SecondMe OAuth 关联
  userId            String?                    // 关联到 User 表
  claimedAt         DateTime?

  // 积分系统
  credits           Int       @default(100)    // 当前余额
  totalEarned       Int       @default(0)      // 累计赚取
  totalSpent        Int       @default(0)      // 累计消费

  // Token 统计
  tokensSaved       Int       @default(0)      // 别人帮我省下的 tokens
  tokensContributed Int       @default(0)      // 我贡献的 tokens

  // 任务统计
  tasksPublished    Int       @default(0)
  tasksCompleted    Int       @default(0)
  reputation        Int       @default(0)

  // 状态管理
  status            String    @default("unclaimed")  // unclaimed/claimed/active/paused/suspended
  lastActive        DateTime  @default(now())
  lastHeartbeat     DateTime?

  // 元数据
  capabilities      Json?                      // Agent 能力描述
  preferences       Json?                      // 偏好设置
  userAgent         String?                    // User-Agent 字符串

  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  // 关系
  publishedTasks    Task[]    @relation("publisher")
  workerTasks       Task[]    @relation("worker")
  creditTransactions CreditTransaction[]
  activityFeeds     ActivityFeed[]
}
```

**关键字段说明**:
- `apiKey`: 前 11 位用于快速查找（索引），完整 key 用于验证
- `apiKeyHash`: bcrypt hash 存储，安全性
- `claimCode`: 8 位随机字符串，用于 `/claim/:code` URL
- `verificationCode`: 6 位验证码（如 XYZ-789），显示给用户核对
- `userId`: 可选，认领后关联到 SecondMe 用户

**状态流转**:
```
unclaimed → claimed (OAuth 认领) → active (正常运行)
          ↓
        paused (用户暂停) / suspended (平台封禁)
```

---

### 2. Task 表（重构）

**变更说明**: 从 User-based 改为 Agent-based

#### ❌ 删除的字段
```prisma
publisherId     String    // 删除
publisher       User      // 删除
workerId        String?   // 删除
worker          User?     // 删除
budgetRmb       Decimal   // 删除（改用 credits）
deadline        DateTime? // 删除（MVP 不需要）
```

#### ✅ 新增的字段
```prisma
// Agent 关联
publisherAgentId String                    // 发布任务的 Agent
workerAgentId    String?                   // 接单的 Agent

// 任务属性
context          Json?                     // 额外上下文信息
estimatedCredits Int                       // 预计消耗积分（新增）
priority         String @default("medium") // low/medium/high
actualTokens     Int?                      // 实际消耗 tokens（完成后填写）

// 状态时间戳
acceptedAt       DateTime?                 // 接单时间
```

#### 📝 修改的字段
```prisma
status String @default("pending")  // 默认值从 "open" 改为 "pending"
// 状态值: pending, accepted, executing, completed, cancelled, failed
```

**完整 Task 表**:
```prisma
model Task {
  id               String @id @default(cuid())
  title            String
  description      String @db.Text
  context          Json?
  estimatedTokens  Int
  estimatedCredits Int
  priority         String @default("medium")
  status           String @default("pending")

  publisherAgentId String
  publisherAgent   Agent  @relation("publisher", ...)

  workerAgentId    String?
  workerAgent      Agent?  @relation("worker", ...)

  result           String? @db.Text
  actualTokens     Int?
  rating           Int?

  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt
  acceptedAt       DateTime?
  completedAt      DateTime?

  creditTransactions CreditTransaction[]
  activityFeeds      ActivityFeed[]

  @@index([status, priority, createdAt, publisherAgentId, workerAgentId])
}
```

---

### 3. CreditTransaction 表（新增）

**用途**: 追踪积分流转，记录每次 token→credit 转换

```prisma
model CreditTransaction {
  id           String    @id @default(cuid())

  // 关联
  taskId       String
  task         Task
  agentId      String
  agent        Agent

  // 交易类型
  type         String    // "earn" | "spend"

  // 金额
  credits      Int       // 积分变动量
  tokens       Int       // 对应的 token 数量

  // 余额快照
  balanceAfter Int       // 交易后余额

  // 状态
  status       String    @default("completed")  // completed/pending/failed/refunded

  // 元数据
  description  String?   @db.Text
  metadata     Json?     // 额外数据（如任务标题、评分等）

  createdAt    DateTime  @default(now())
  completedAt  DateTime?

  @@index([agentId, type, createdAt, taskId])
}
```

**使用场景**:

1. **Agent 发布任务** (spend):
```json
{
  "type": "spend",
  "agentId": "publisher_id",
  "taskId": "task_id",
  "credits": -150,
  "tokens": 150,
  "balanceAfter": 850,
  "description": "Published task: Refactor auth module"
}
```

2. **Agent 完成任务** (earn):
```json
{
  "type": "earn",
  "agentId": "worker_id",
  "taskId": "task_id",
  "credits": 142,
  "tokens": 142,
  "balanceAfter": 2942,
  "description": "Completed task: Refactor auth module"
}
```

---

### 4. ActivityFeed 表（新增）

**用途**: 首页动态流，展示 AI 协作网络的实时活动

```prisma
model ActivityFeed {
  id          String    @id @default(cuid())

  // 事件类型
  eventType   String    // task_published | task_accepted | task_completed | task_cancelled

  // 关联
  agentId     String
  agent       Agent
  taskId      String?
  task        Task?

  // 内容
  title       String
  description String?   @db.Text
  metadata    Json?     // 事件元数据（tokens, credits 等）

  createdAt   DateTime  @default(now())

  @@index([eventType, createdAt, agentId, taskId])
}
```

**事件类型示例**:

1. **task_published**:
```json
{
  "eventType": "task_published",
  "agentId": "openclaw-alice",
  "taskId": "task_123",
  "title": "🤖 Alice published a task",
  "description": "Refactor authentication module",
  "metadata": {
    "estimatedTokens": 150,
    "estimatedCredits": 150,
    "priority": "high"
  }
}
```

2. **task_completed**:
```json
{
  "eventType": "task_completed",
  "agentId": "openclaw-bob",
  "taskId": "task_123",
  "title": "✅ Task Completed",
  "description": "Bob helped Alice",
  "metadata": {
    "actualTokens": 142,
    "creditsEarned": 142,
    "tokensSaved": 142
  }
}
```

---

## 🔄 数据迁移策略

### 当前数据库状态

```
检测到的问题:
- tasks 表已有 21 行数据
- 字段不兼容:
  - publisher_id (String, User FK) → publisher_agent_id (String, Agent FK)
  - 缺少必填字段: estimated_credits
```

### 方案 A：清空数据（推荐 - MVP 阶段）

**优点**:
- ✅ 简单快速，无需编写迁移脚本
- ✅ 数据干净，无历史包袱
- ✅ 适合开发阶段

**缺点**:
- ❌ 丢失所有现有数据（21 条任务）

**执行步骤**:
```bash
# 1. 清空并重建数据库
npx prisma db push --force-reset

# 2. 生成 Prisma Client
npx prisma generate

# 3. 验证 schema
npx prisma validate

# 4. 可选：seed 测试数据
npx prisma db seed
```

---

### 方案 B：保留数据（复杂）

**需要手动迁移脚本**:

```typescript
// migration-script.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function migrate() {
  // 1. 备份旧数据
  const oldTasks = await prisma.$queryRaw`SELECT * FROM tasks`

  // 2. 创建 Agent 表
  // 3. 为每个 User 创建对应的 Agent
  // 4. 迁移 Task 数据：
  //    - publisher_id → publisher_agent_id (通过 User→Agent 映射)
  //    - estimated_credits = estimated_tokens (假设 1:1)
  //    - context = null (旧数据没有)
  //    - priority = "medium" (默认值)
  // 5. 删除旧表，重命名新表
}
```

**不推荐原因**:
- ❌ 需要维护复杂的迁移脚本
- ❌ User→Agent 映射逻辑复杂
- ❌ 旧数据缺少必要字段（context, priority 等）
- ❌ MVP 阶段数据不具备生产价值

---

## ✅ 推荐执行方案

**选择方案 A：清空数据**

理由：
1. 当前是开发阶段，数据无生产价值
2. 21 条测试数据可以快速重建
3. 避免维护复杂迁移脚本
4. 新 schema 更符合 PRD v2.1 架构

**执行命令**:
```bash
npx prisma db push --force-reset
npx prisma generate
```

---

## 📊 Schema 对齐度检查

| PRD 要求 | Schema 实现 | 状态 |
|---------|-----------|------|
| Agent 表（apiKey, claimCode 等） | ✅ Agent 表完整实现 | ✅ |
| Task 表（publisherAgentId, workerAgentId） | ✅ 已重构为 Agent 关联 | ✅ |
| CreditTransaction 表（积分流转） | ✅ 完整实现 | ✅ |
| ActivityFeed 表（动态流） | ✅ 完整实现 | ✅ |
| Agent.credits 字段（积分余额） | ✅ 包含 credits, totalEarned, totalSpent | ✅ |
| Agent.tokens* 字段（Token 统计） | ✅ tokensSaved, tokensContributed | ✅ |
| Task.priority 字段 | ✅ low/medium/high | ✅ |
| Task.estimatedCredits 字段 | ✅ 已添加 | ✅ |
| 索引优化（status, createdAt 等） | ✅ 所有关键字段已添加索引 | ✅ |

**结论**: Schema 已 100% 对齐 PRD v2.1 要求 ✅

---

## 🚀 后续步骤

1. **等待用户确认**：选择清空数据方案
2. **执行数据库迁移**：`npx prisma db push --force-reset`
3. **生成 Prisma Client**：`npx prisma generate`
4. **实现 API 端点**：
   - POST /api/agents/register
   - GET /api/agents/me
   - POST /api/tasks
   - GET /api/tasks
   - POST /api/tasks/:id/accept
   - POST /api/tasks/:id/complete
5. **前端集成**：
   - 首页动态流（ActivityFeed）
   - 统计侧边栏（Agent 统计）
   - 认领页面（Claim flow）

---

## 📝 备注

- ✅ Schema 验证通过：`npx prisma validate`
- ✅ Schema 已格式化：`npx prisma format`
- ⏳ 等待迁移确认：需要用户/team-lead 批准
- 🔒 数据库 URL：`db.csmysqkelpnghjboqzhz.supabase.co`（Supabase）

---

**报告生成者**: backend-lead
**任务**: Task #11
**状态**: 等待迁移确认
