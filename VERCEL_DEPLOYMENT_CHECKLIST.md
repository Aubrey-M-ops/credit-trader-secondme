# Vercel 部署检查清单

## ✅ 代码修复（已完成）

- [x] 添加 `postinstall` 脚本自动生成 Prisma Client
- [x] 修复所有 lint 和 TypeScript 错误
- [x] 本地构建测试通过

## 🔧 Vercel 环境变量配置

请在 Vercel Dashboard > Settings > Environment Variables 中配置以下变量：

### 必需的环境变量

#### 数据库配置
```
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.csmysqkelpnghjboqzhz.supabase.co:5432/postgres
NEXT_PUBLIC_SUPABASE_URL=https://csmysqkelpnghjboqzhz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### SecondMe OAuth 配置
```
SECONDME_CLIENT_ID=52db82cf-d874-4249-9324-62eb62570026
SECONDME_CLIENT_SECRET=cf6c8b7fbf46e46503dc4b4a3a9469f8cf9f7b0059710c34b0fd7ccd4e5918f9
SECONDME_REDIRECT_URI=https://YOUR-APP.vercel.app/api/auth/callback
SECONDME_API_BASE_URL=https://app.mindos.com/gate/lab
SECONDME_OAUTH_URL=https://go.second.me/oauth/
SECONDME_TOKEN_ENDPOINT=https://app.mindos.com/gate/lab/api/oauth/token/code
```

#### 应用配置
```
NEXT_PUBLIC_APP_URL=https://YOUR-APP.vercel.app
NODE_ENV=production
```

## 📋 部署步骤

### 1. 首次部署
1. 推送代码到 GitHub
2. 在 Vercel 中导入项目
3. Vercel 会自动分配一个域名（如 `your-app-xxx.vercel.app`）
4. **暂时先不配置环境变量**，让它部署失败（这样能拿到域名）

### 2. 配置环境变量
1. 获取 Vercel 分配的域名
2. 更新以下环境变量中的 `YOUR-APP.vercel.app`：
   - `SECONDME_REDIRECT_URI`
   - `NEXT_PUBLIC_APP_URL`
3. 在 Vercel Dashboard 中添加所有环境变量

### 3. 更新 SecondMe 回调 URL
1. 访问 SecondMe Developer Console
2. 添加回调 URL: `https://YOUR-APP.vercel.app/api/auth/callback`

### 4. 重新部署
1. 在 Vercel Dashboard 中点击 "Redeploy"
2. 或者推送新的 commit 触发自动部署

## 🐛 常见问题排查

### 问题 1: "Prisma Client not found"
**原因**: `postinstall` 脚本未执行
**解决**:
- 确认 `package.json` 中有 `"postinstall": "prisma generate"`
- 在 Vercel 中查看 Build Logs，确认 prisma generate 执行成功

### 问题 2: "DATABASE_URL is not defined"
**原因**: 环境变量未配置
**解决**:
- 在 Vercel Dashboard 中配置所有必需的环境变量
- 确保选择了正确的环境（Production / Preview / Development）

### 问题 3: "OAuth callback failed"
**原因**: 回调 URL 不匹配
**解决**:
- 确认 `SECONDME_REDIRECT_URI` 与实际 Vercel 域名一致
- 确认在 SecondMe Console 中添加了该回调 URL

### 问题 4: Build 超时
**原因**: Prisma generate 或依赖安装太慢
**解决**:
- 检查 `prisma/schema.prisma` 是否过大
- 考虑使用 Vercel Pro 计划（更长的构建时间）

## 📊 验证部署成功

部署成功后，访问以下端点验证：

1. **健康检查**: `https://YOUR-APP.vercel.app/api/health`
   - 应该返回 `{"status":"ok"}`

2. **首页**: `https://YOUR-APP.vercel.app/`
   - 应该正常显示

3. **数据库连接**: `https://YOUR-APP.vercel.app/api/stats`
   - 应该返回统计数据（不报错）

## 🔗 相关文档

- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Prisma with Vercel](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)
- [Next.js on Vercel](https://vercel.com/docs/frameworks/nextjs)

## 📝 当前状态

- ✅ 代码已修复并提交
- ⏳ 等待在 Vercel 中配置环境变量
- ⏳ 等待重新部署
