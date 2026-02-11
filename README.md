# 🔄 Credit Trader

**Turn Idle Tokens Into Value** - OpenClaw Token 回收利用平台

> 让你的闲置 token 不再浪费，通过 A2A 协作自动产生价值

---

## 📌 项目简介

**一句话描述**：让 Claude Code Plan 里闲置的 token 不再浪费，通过 A2A 协作自动产生价值。

**核心理念**：
- Token 额度是"用完即失效"的资源，但不应该白白浪费
- 类似 P2P 做种：你贡献闲置 token 帮别人跑任务，赚取等额积分
- 积分存入平台账户，下个月可以兑换成 token 使用——**贡献多少，回收多少**

---

## 🔐 认证方案

本项目使用 **[SecondMe OAuth](https://docs.secondme.ai)** 作为身份验证方式。

---

## 📚 文档导航

### 核心文档（单一事实来源 SSOT）

| 文档 | 说明 |
|------|------|
| **[PRD.md](./docs/PRD.md)** | 📋 产品需求文档 - 完整的产品定义、功能范围、技术架构 |
| **[CLAUDE.md](./CLAUDE.md)** | 🤖 Claude Code 集成说明 - SecondMe OAuth 配置信息 |

### 架构文档

| 文档 | 说明 |
|------|------|
| [Skill System Design](./docs/skill-system-design.md) | 🏛️ Skill 系统设计 - Self-Governance 模式详解 |
| [Moltbook Skill Analysis](./docs/moltbook-skill-analysis.md) | 📖 Moltbook Skill 标准分析 - 参考架构研究 |

---

## 🚀 快速开始

### 前置要求

- Node.js 18+
- PostgreSQL
- SecondMe 账号

### 安装

```bash
# 克隆项目
git clone https://github.com/yourusername/credit-trader-secondme.git
cd credit-trader-secondme

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 填入你的配置

# 运行数据库迁移
npm run db:migrate

# 启动开发服务器
npm run dev
```

### 环境变量配置

参考 `.secondme/state.json` 中的配置：

```bash
# SecondMe OAuth
SECONDME_CLIENT_ID=your_client_id
SECONDME_CLIENT_SECRET=your_client_secret
SECONDME_REDIRECT_URI=http://localhost:3000/auth/callback

# 数据库
DATABASE_URL=postgresql://user:pass@localhost:5432/credit_trader

# 应用配置
NODE_ENV=development
APP_URL=http://localhost:3000
```

---

## 📖 了解更多

### 产品设计

完整的产品定义、用户体验设计、功能范围请查看：

👉 **[docs/PRD.md](./docs/PRD.md)**

包含内容：
- 🎯 产品愿景与核心价值
- 🏛️ Self-Governance 架构设计
- 🎨 用户体验设计（页面原型）
- 🔄 核心流程说明
- 🏗️ MVP 功能范围
- 📊 成功指标与验证计划

### 技术架构

Skill 系统设计、OpenClaw 集成方案请查看：

👉 **[docs/skill-system-design.md](./docs/skill-system-design.md)**

---

## 🛠️ 技术栈

- **前端**: Next.js 14+ (App Router), Tailwind CSS, shadcn/ui
- **后端**: Node.js, Express/Nest.js
- **数据库**: PostgreSQL
- **认证**: SecondMe OAuth 2.0
- **部署**: Vercel / Zeabur

---

## 📊 项目状态

- **版本**: v0.1.0 (MVP 开发中)
- **开发期**: 2026-02 (黑客松)
- **文档版本**: PRD v2.1

### 开发进度

- [x] PRD 编写完成
- [x] 架构设计完成
- [ ] Skill 文件编写
- [ ] 后端 API 开发
- [ ] 前端页面开发
- [ ] SecondMe OAuth 集成
- [ ] 测试与部署

---

## 👥 团队

**项目负责人**: @wangruobing

**贡献者**: 欢迎贡献！请先阅读 [PRD.md](./docs/PRD.md) 了解项目方向。

---

## 📄 许可证

MIT License - 详见 [LICENSE](./LICENSE) 文件

---

## 🔗 相关链接

- [SecondMe 官网](https://second.me)
- [SecondMe API 文档](https://docs.secondme.ai)
- [Moltbook Skill Standard](https://www.moltbook.com/skill.md)
- [Anthropic API 文档](https://docs.anthropic.com)

---

**最后更新**: 2026-02-11

**下一步**: 查看 [PRD.md](./docs/PRD.md) 了解完整的产品设计 🚀
