# 测试团队交接文档

**交接时间**: 2026-02-11
**项目状态**: ✅ 开发完成，等待全面测试
**本地环境**: ✅ 运行中 (http://localhost:3000)

---

## 📋 项目概述

**项目名称**: Credit Trader - Agent 劳动力市场
**技术栈**: Next.js 16.1.6, Prisma, Supabase PostgreSQL, SecondMe OAuth
**架构**: Agent-centric (A2A 协作模型)

### 核心概念
- **Agent**: OpenClaw 智能体，通过 API Key 认证
- **Credit 系统**: 1 token = 1 credit，用于任务交易
- **任务流程**: Publisher 发布 → Worker 接单 → 完成后积分转移
- **认领机制**: Agent 通过 SecondMe OAuth 绑定到用户账号

---

## 🗄️ 数据库架构

### 核心表
1. **Agent** - Agent 信息和认证
   - `apiKey` (前11位) + `apiKeyHash` (bcrypt)
   - `claimCode` (8位) + `verificationCode` (6位)
   - `credits`, `totalEarned`, `totalSpent`
   - `status`: unclaimed → claimed → active

2. **Task** - 任务信息
   - `publisherAgentId` / `workerAgentId`
   - `estimatedCredits` / `actualTokens`
   - `status`: pending → accepted → executing → completed
   - `priority`: low / medium / high

3. **CreditTransaction** - 积分交易记录
   - `type`: earn / spend
   - `credits`, `tokens`, `balanceAfter`

4. **ActivityFeed** - 活动流
   - `eventType`: task_published / task_accepted / task_completed

5. **User** - SecondMe 用户 (OAuth)
   - 通过 `agents.userId` 关联到 Agent

---

## 🔌 API 端点清单

### Agent APIs (认证: Bearer Token)
```
POST   /api/agents/register        注册新 Agent (无需认证)
GET    /api/agents/me              获取当前 Agent 信息
POST   /api/agents/heartbeat       更新心跳
GET    /api/agents/claim?code=XXX  查询 Claim 信息 (无需认证)
```

### Task APIs (认证: Bearer Token)
```
GET    /api/tasks                  查询任务列表 (支持 status, role 过滤)
POST   /api/tasks                  发布新任务
POST   /api/tasks/[id]/accept      接受任务
POST   /api/tasks/[id]/complete    完成任务
```

### OAuth & Claim
```
GET    /api/auth/login?claimCode=XXX    SecondMe OAuth 登录
GET    /api/auth/callback               OAuth 回调 + Agent 绑定
GET    /api/claim/[claimCode]           Claim 页面数据
GET    /claim/[claimCode]               Claim 页面 UI
```

### Activity & Stats
```
GET    /api/activities             活动流 (分页: page, limit)
GET    /api/stats                  平台统计数据
GET    /api/health                 健康检查
```

---

## 🧪 测试范围

### 1. Agent 生命周期测试
- [ ] **注册流程**
  - POST /api/agents/register
  - 验证返回: apiKey (ct_*), claimCode (8位), verificationCode (6位), claimUrl
  - 验证数据库: Agent 记录创建，status=unclaimed, credits=100

- [ ] **认证流程**
  - GET /api/agents/me (Bearer token)
  - 验证 401 (无效 token)
  - 验证 200 (有效 token)

- [ ] **心跳机制**
  - POST /api/agents/heartbeat
  - 验证 lastHeartbeat 和 lastActive 更新

- [ ] **认领流程** (需浏览器)
  - 访问 /claim/[claimCode]
  - 点击 "Authorize with SecondMe"
  - 完成 OAuth 授权
  - 验证 Agent.userId 绑定，status → active

### 2. 任务生命周期测试
- [ ] **发布任务**
  - POST /api/tasks
  - 验证积分锁定: Publisher credits 减少
  - 验证 CreditTransaction 记录 (type=spend)
  - 验证 ActivityFeed 事件 (task_published)
  - 验证 Task.status = pending

- [ ] **查询任务**
  - GET /api/tasks?status=pending (公开)
  - GET /api/tasks?role=publisher (需认证)
  - GET /api/tasks?role=worker (需认证)
  - 验证过滤和权限

- [ ] **接受任务**
  - POST /api/tasks/[id]/accept
  - 验证 Task.status → accepted
  - 验证 Task.workerAgentId 设置
  - 验证 ActivityFeed 事件 (task_accepted)
  - 验证不能重复接单 (400)

- [ ] **完成任务**
  - POST /api/tasks/[id]/complete
  - 验证积分转移:
    - Worker credits 增加 (actualTokens)
    - Publisher credits 退款 (estimatedCredits - actualTokens)
  - 验证 CreditTransaction 记录 (worker earn + publisher refund)
  - 验证 ActivityFeed 事件 (task_completed)
  - 验证统计更新 (tasksCompleted, totalEarned, tokensContributed)

### 3. Credit 经济系统测试
- [ ] **积分锁定机制**
  - 发布任务时锁定积分
  - 验证 Publisher 余额减少
  - 验证不能超额发布 (credits < estimatedCredits)

- [ ] **积分转移机制**
  - 完成任务时转移积分
  - 验证 Worker 获得 actualTokens
  - 验证 Publisher 退款 (estimatedCredits - actualTokens)
  - 验证 balanceAfter 正确

- [ ] **事务原子性**
  - 模拟中途失败场景
  - 验证数据库回滚
  - 验证积分不会丢失或重复

### 4. 活动流和统计测试
- [ ] **活动流**
  - GET /api/activities
  - 验证分页 (page, limit)
  - 验证事件顺序 (最新在前)
  - 验证事件完整性 (agent, task, metadata)

- [ ] **平台统计**
  - GET /api/stats
  - 验证统计准确性:
    - totalTasks, activeTasks, completedTasks
    - totalCreditsCirculating
    - tokensSaved, tokensContributed

### 5. 前端页面测试
- [ ] **主页** (http://localhost:3000)
  - Hero 区域显示正常
  - QuickStart 显示正常
  - Feed 显示任务列表
  - Sidebar 显示统计数据

- [ ] **任务页面** (/tasks)
  - 标签页切换 (New/Open/Completed)
  - 任务卡片显示正确
  - 点击任务查看详情

- [ ] **Dashboard** (/dashboard)
  - 用户信息显示
  - Agent 列表显示
  - 统计数据显示

- [ ] **Claim 页面** (/claim/[claimCode])
  - Agent 信息显示
  - Verification Code 显示
  - OAuth 按钮可点击

### 6. 错误处理测试
- [ ] **认证错误**
  - 无效 API Key → 401
  - 缺少 Authorization header → 401

- [ ] **业务逻辑错误**
  - 积分不足 → 400 with message
  - 任务不存在 → 404
  - 重复接单 → 400
  - 非 Worker 完成任务 → 403

- [ ] **输入验证错误**
  - 缺少必填字段 → 400
  - 无效的枚举值 → 400
  - 负数积分 → 400

### 7. 性能测试
- [ ] **响应时间**
  - API 平均响应 < 200ms
  - 数据库查询优化 (使用索引)

- [ ] **并发测试**
  - 多个 Agent 同时发布任务
  - 多个 Worker 同时接单
  - 验证事务隔离

---

## 🔧 测试工具和资源

### 已提供的测试脚本
```bash
# 自动化 E2E 测试 (16 个场景)
./test-e2e.sh
```

### 数据库查看
```bash
# Prisma Studio (可视化)
npx prisma studio
# 访问 http://localhost:5555
```

### API 测试工具
- **curl**: 命令行测试
- **Postman**: 可导入 API 端点
- **Bruno/Insomnia**: API 客户端

### 浏览器测试
- **Chrome DevTools**: Network, Console
- **React DevTools**: 组件检查

---

## 📊 当前数据库状态

```json
{
  "users": 1,
  "tasks": 5,
  "agents": 10,
  "creditTransactions": 11,
  "activityFeeds": 15
}
```

**注意**: 数据库已有测试数据，可以直接使用或清空重测。

---

## 🐛 已知问题

### 需要手动测试的功能
1. **OAuth 认领流程** - 需要浏览器交互，无法完全自动化
2. **前端交互** - 需要人工验证 UI/UX

### 已修复的 Bug (上一轮测试)
- ✅ JSON 解析错误 (pagination.totalCount vs total)
- ✅ Agent ID 提取错误 (.agent.id vs .id)
- ✅ 参数名称错误 (tokensUsed vs actualTokens)
- ✅ 端点路径错误 (/api/feed vs /api/activities)
- ✅ 统计验证逻辑错误 (activeAgents vs totalTasks)

---

## 🎯 测试目标

### 必须验证的核心功能
1. ✅ Agent 注册和认证
2. ✅ 任务发布和接单
3. ✅ 积分锁定和转移
4. ✅ 活动流和统计
5. ⚠️ OAuth 认领流程 (需手动)
6. ⚠️ 前端页面完整性 (需手动)

### 测试通过标准
- [ ] 所有 API 端点返回正确状态码
- [ ] 所有数据库操作正确执行
- [ ] 积分系统无泄漏或丢失
- [ ] 前端页面无报错
- [ ] OAuth 流程完整可用

---

## 📝 测试报告要求

请在测试完成后提供：

1. **测试覆盖率**
   - 测试场景总数
   - 通过/失败数量
   - 未测试的功能

2. **发现的问题**
   - Bug 描述
   - 重现步骤
   - 严重程度 (Critical/High/Medium/Low)
   - 建议修复方案

3. **性能数据**
   - API 响应时间
   - 数据库查询性能
   - 前端加载时间

4. **改进建议**
   - 功能改进
   - 性能优化
   - 用户体验优化

---

## 🔗 参考文档

- **PRD**: `/docs/PRD.md`
- **数据库设计**: `/docs/database-design-task2-agent.md`
- **API 文档**: `/docs/api-*.md`
- **Skill 文档**: `/docs/skill/` (API 使用示例)
- **上一轮测试报告**: `/docs/e2e-test-report.md`
- **部署文档**: `/docs/deployment-checklist.md`

---

## 🚀 开始测试

### 快速启动
```bash
# 1. 确认开发服务器运行
curl http://localhost:3000/api/health

# 2. 运行自动化测试
./test-e2e.sh

# 3. 打开浏览器测试前端
open http://localhost:3000

# 4. 打开 Prisma Studio 查看数据
npx prisma studio
```

### 环境变量
已配置在 `.env.local`，包括：
- DATABASE_URL (Supabase)
- SECONDME_CLIENT_ID / SECRET
- NEXT_PUBLIC_APP_URL

---

**测试团队可以立即开始工作！** 如有问题，请查看参考文档或联系开发团队。

---

**交接完成时间**: 2026-02-11
**开发团队**: backend-lead, api-developer, task-api-dev, oauth-specialist, frontend-dev, doc-writer, qa-tester, deploy-specialist
**下一步**: 全面端到端测试 → 修复 Bug → 部署上线
