# CI/CD 配置说明

本项目配置了三个 GitHub Actions 工作流，用于自动化代码检查和部署流程。

## 工作流说明

### 1. CI Workflow (`.github/workflows/ci.yml`)

**触发时机**:
- Push 到 `master`, `main`, `develop` 分支
- 对这些分支创建 Pull Request

**执行内容**:
- **Lint & Type Check** 任务
  - 运行 ESLint 代码风格检查
  - 运行 TypeScript 类型检查
  - 生成 Prisma Client
  - ✨ **检查 Supabase 配置**: 验证 Supabase 环境变量是否正确配置
  - ✨ **验证 Prisma Schema**: 确保数据库模型定义有效

- **Build Check** 任务
  - ✨ **验证 Supabase 集成**: 检查 @supabase/supabase-js 包是否已安装
  - 验证项目是否可以成功构建
  - 使用 mock 环境变量进行构建测试（包含完整的 Supabase 环境变量）
  - 确保代码可以正常打包

**目的**: 确保每次代码变更都不会破坏项目的基本构建和代码质量，同时验证 Supabase 配置完整性。

---

### 2. PR Check Workflow (`.github/workflows/pr-check.yml`)

**触发时机**:
- Pull Request 被创建、更新或重新打开

**执行内容**:
- 检查代码中是否有遗留的 `console.log` 语句（警告）
- 运行完整的 Lint 检查
- 运行 TypeScript 类型检查
- ✨ **验证 Supabase 配置**: 确保 Supabase 包已正确安装
- 验证项目构建（包含完整的 Supabase 环境变量）
- 生成 PR 检查摘要

**目的**: 在合并 PR 之前确保代码质量和 Supabase 配置完整性，防止低质量代码进入主分支。

---

### 3. Deploy Notification Workflow (`.github/workflows/deploy-notification.yml`)

**触发时机**:
- Push 到 `master` 或 `main` 分支

**执行内容**:
- 提取 commit 信息（作者、消息、SHA）
- 生成部署摘要
- 提醒查看 Vercel 部署状态

**目的**: 记录部署信息，提供部署追踪。

---

## 环境变量配置

### 本地开发
在 `.env.local` 文件中配置所有环境变量。

### GitHub Actions
工作流使用 mock 环境变量进行构建测试，不需要在 GitHub Secrets 中配置真实凭证。

**Mock 环境变量包含**:
- `DATABASE_URL`: PostgreSQL 连接字符串
- `SECONDME_CLIENT_ID`, `SECONDME_CLIENT_SECRET`: SecondMe OAuth 凭证
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase 项目 URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase 匿名密钥
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase 服务角色密钥
- 其他 SecondMe API 和应用配置

### Vercel 部署
在 Vercel 项目设置中配置以下环境变量：

```bash
# SecondMe OAuth
SECONDME_CLIENT_ID=
SECONDME_CLIENT_SECRET=
SECONDME_REDIRECT_URI=

# Database
DATABASE_URL=

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# SecondMe API
SECONDME_API_BASE_URL=
SECONDME_OAUTH_URL=
SECONDME_TOKEN_ENDPOINT=

# App Config
NEXT_PUBLIC_APP_URL=
```

---

## 工作流状态徽章

可以在 README.md 中添加以下徽章来显示 CI 状态：

```markdown
![CI](https://github.com/[username]/credit-trader-secondme/workflows/CI/badge.svg)
![PR Check](https://github.com/[username]/credit-trader-secondme/workflows/PR%20Check/badge.svg)
```

---

## 最佳实践

### 开发流程
1. **创建功能分支**: `git checkout -b feature/your-feature`
2. **开发并提交**: 进行开发并提交代码
3. **推送到远程**: `git push origin feature/your-feature`
4. **创建 PR**: 在 GitHub 上创建 Pull Request（目标分支：master）
5. **等待 CI 检查**: PR Check 工作流会自动运行
6. **修复问题**: 如果检查失败，修复问题并重新推送
7. **合并到主分支**: 检查通过后合并到 master 分支
8. **自动部署**: Vercel 会自动部署到生产环境

### 代码质量检查
- 提交前本地运行 `npm run lint` 检查代码风格
- 使用 `npx tsc --noEmit` 检查类型错误
- 删除调试用的 `console.log` 语句
- 确保 `.env.local` 不被提交到仓库

---

## 故障排查

### CI 失败
1. 查看 GitHub Actions 日志找到具体错误
2. 本地复现问题：`npm ci && npm run lint && npx tsc --noEmit && npm run build`
3. 修复问题后重新推送

### 构建失败
- 检查是否所有依赖都在 `package.json` 中
- 确保 Prisma schema 正确
- 验证 TypeScript 配置
- ✨ **检查 Supabase 配置**: 确保 `@supabase/supabase-js` 已安装

### Supabase 检查失败
1. **环境变量检查失败**:
   - 确保 `NEXT_PUBLIC_SUPABASE_URL` 已在环境变量中配置
   - 确保 `NEXT_PUBLIC_SUPABASE_ANON_KEY` 已配置
   - 本地运行: `echo $NEXT_PUBLIC_SUPABASE_URL` 验证环境变量

2. **Supabase 包缺失**:
   - 运行 `npm install @supabase/supabase-js` 安装包
   - 确认 `package.json` 中包含此依赖
   - 运行 `npm ci` 重新安装所有依赖

3. **Prisma Schema 验证失败**:
   - 运行 `npx prisma validate` 检查 schema 语法
   - 确保数据库连接字符串格式正确
   - 检查 Prisma schema 中的模型定义

### 部署失败
- 检查 Vercel 环境变量是否正确配置
- ✨ **特别注意**: 确保所有 Supabase 环境变量都已在 Vercel 中配置
- 查看 Vercel 部署日志
- 确认 Build Command 设置为: `npx prisma generate && npm run build`

---

## Supabase 检查详解

### 检查项说明

#### 1. Supabase 配置检查 (CI Workflow)
```yaml
- name: Check Supabase Configuration
  run: |
    echo "Checking Supabase environment variables..."
    if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
      echo "❌ NEXT_PUBLIC_SUPABASE_URL is not set"
      exit 1
    fi
    if [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
      echo "❌ NEXT_PUBLIC_SUPABASE_ANON_KEY is not set"
      exit 1
    fi
    echo "✅ Supabase environment variables are configured"
```
**作用**: 确保所有必需的 Supabase 环境变量都已正确配置。

#### 2. Prisma Schema 验证
```yaml
- name: Validate Prisma Schema
  run: npx prisma validate
```
**作用**: 验证 Prisma schema 文件语法正确，确保数据库模型定义有效。

#### 3. Supabase 包验证
```yaml
- name: Verify Supabase Integration
  run: |
    echo "Verifying Supabase package installation..."
    if grep -q "@supabase/supabase-js" package.json; then
      echo "✅ @supabase/supabase-js is installed"
    else
      echo "⚠️  @supabase/supabase-js is not in package.json"
    fi
```
**作用**: 检查 Supabase JavaScript 客户端是否已正确安装。

### 本地测试 Supabase 配置

在推送代码前，可以本地运行以下命令测试：

```bash
# 1. 检查环境变量
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY

# 2. 验证 Prisma schema
npx prisma validate

# 3. 检查 Supabase 包
grep "@supabase/supabase-js" package.json

# 4. 测试构建
npm run build
```

---

## 扩展配置

### 添加测试
可以在 CI workflow 中添加测试步骤：

```yaml
- name: Run Tests
  run: npm test
```

### 添加安全扫描
可以添加依赖安全检查：

```yaml
- name: Security Audit
  run: npm audit --audit-level=moderate
```

### 添加代码覆盖率
集成测试覆盖率工具：

```yaml
- name: Code Coverage
  run: npm run test:coverage
```

### 添加 Supabase 连接测试（可选）
在有真实数据库凭证的情况下，可以添加实际的连接测试：

```yaml
- name: Test Supabase Connection
  run: node scripts/test-supabase-connection.js
  env:
    NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
    NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
```

---

## 联系支持

如有问题，请在项目 Issues 中提出。
