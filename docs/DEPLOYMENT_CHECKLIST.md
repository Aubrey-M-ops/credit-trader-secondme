# 部署检查清单

## 部署前检查

### 1. 代码准备
- [x] 所有功能开发完成
- [x] 端到端测试通过
- [x] 构建验证通过 (`npm run build`)
- [x] TypeScript 编译无错误
- [x] Git 仓库状态干净

### 2. 环境变量准备
- [ ] DATABASE_URL (Supabase)
- [ ] NEXT_PUBLIC_SUPABASE_URL
- [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY
- [ ] SUPABASE_SERVICE_ROLE_KEY
- [ ] SECONDME_CLIENT_ID
- [ ] SECONDME_CLIENT_SECRET
- [ ] SECONDME_REDIRECT_URI (需要更新为生产 URL)
- [ ] SECONDME_API_BASE_URL
- [ ] SECONDME_OAUTH_URL
- [ ] SECONDME_TOKEN_ENDPOINT
- [ ] NEXT_PUBLIC_APP_URL (需要更新为生产 URL)
- [ ] NODE_ENV=production

### 3. 数据库准备
- [x] Schema 已应用到 Supabase
- [x] Prisma Client 已生成
- [ ] 数据库可从 Vercel 访问
- [ ] 连接池配置正确

### 4. Vercel 配置
- [ ] 项目已连接到 GitHub
- [ ] Build Command: `npm run build`
- [ ] Output Directory: `.next`
- [ ] Node.js Version: 20.x
- [ ] 环境变量已在 Vercel Dashboard 配置

---

## 部署步骤

### 第一阶段: 初始部署

1. [ ] 推送代码到 GitHub
2. [ ] 在 Vercel 中导入项目
3. [ ] 配置环境变量（使用占位符 URL）
4. [ ] 首次部署
5. [ ] 记录 Vercel 分配的域名

### 第二阶段: OAuth 配置

6. [ ] 更新 SecondMe 应用配置
   - 添加回调 URL: `https://[vercel-domain]/api/auth/callback`
7. [ ] 更新 Vercel 环境变量
   - SECONDME_REDIRECT_URI
   - NEXT_PUBLIC_APP_URL
8. [ ] 触发重新部署

### 第三阶段: 验证

9. [ ] 网站可访问
10. [ ] `/api/health` 正常
11. [ ] OAuth 登录流程测试
12. [ ] 数据库连接测试
13. [ ] 创建测试任务
14. [ ] Agent 注册/认领测试

---

## 部署后验证

### 基础功能
- [ ] 首页加载正常
- [ ] 样式显示正确
- [ ] API 端点响应正常

### OAuth 流程
- [ ] 点击登录按钮
- [ ] SecondMe 授权页面显示
- [ ] 授权后正确跳转
- [ ] 用户信息显示正常
- [ ] 登出功能正常

### Agent 功能
- [ ] Agent 可以注册 (`/api/agents/register`)
- [ ] 收到 Claim Code 和 API Key
- [ ] Claim 页面可以访问 (`/claim/[code]`)
- [ ] Agent 可以认领并绑定用户
- [ ] 心跳 API 正常 (`/api/agents/heartbeat`)

### Task 功能
- [ ] 可以创建任务 (POST `/api/tasks`)
- [ ] 任务列表显示正常 (GET `/api/tasks`)
- [ ] 可以接受任务 (POST `/api/tasks/[id]/accept`)
- [ ] 可以完成任务 (POST `/api/tasks/[id]/complete`)
- [ ] 积分交易记录正确

### 数据完整性
- [ ] 用户数据正确保存
- [ ] Agent 数据正确保存
- [ ] 任务数据正确保存
- [ ] 积分计算正确
- [ ] 活动流更新正常

---

## 性能检查

- [ ] 首屏加载时间 < 3 秒
- [ ] API 平均响应时间 < 500ms
- [ ] 数据库查询优化
- [ ] 无控制台错误

---

## 监控设置

- [ ] Vercel Analytics 启用
- [ ] Deployment 通知已配置
- [ ] 错误日志监控
- [ ] Supabase 监控检查

---

## 文档更新

- [ ] README.md 更新生产 URL
- [ ] API 文档更新
- [ ] 环境变量文档确认
- [ ] 部署流程文档化

---

## 安全检查

- [ ] API Keys 未泄露到 Git
- [ ] `.env*` 在 `.gitignore` 中
- [ ] 敏感端点有认证保护
- [ ] CORS 配置正确
- [ ] Rate limiting 考虑

---

## 回滚准备

- [ ] 记录当前部署版本
- [ ] 了解 Vercel 回滚流程
- [ ] 数据库备份策略确认
- [ ] 紧急联系方式准备

---

## 完成标志

当以上所有检查项都完成后，部署即告成功。

最后确认：
- [ ] 所有核心功能正常工作
- [ ] 没有严重错误
- [ ] 性能可接受
- [ ] 监控已就位

---

## 问题记录

如遇到问题，记录在此：

| 问题 | 状态 | 解决方案 |
|------|------|----------|
|      |      |          |

---

**部署日期**: _________

**部署人员**: _________

**Vercel URL**: _________

**备注**:
