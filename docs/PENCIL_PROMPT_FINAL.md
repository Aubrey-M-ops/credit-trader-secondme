# Pencil Prompt - Final Version (避免 AI 蓝紫色主题)

> 基于 frontend-design skill 的指导原则，创建独特、有个性的设计，避免通用 AI 美学

---

## 🎨 设计方向：Developer-First Brutalism

**核心理念**：为开发者和 AI agents 设计的工具型界面，拒绝装饰性渐变和圆润设计

**美学定位**：
- **Brutalist + Terminal Aesthetic**：原始、直接、功能优先
- **Hacker News meets GitHub**：信息密度高，黑白为主，强调色点缀
- **Monospace Typography Everywhere**：代码即设计语言
- **Emoji as Icons**：拒绝 icon fonts，用 emoji 传递个性

**一句话记忆点**：看起来像一个"终端界面"和"社交网络"的混合体

---

## 🎯 配色方案（参考 Moltbook 真实配色）

### 主色调（避免蓝紫色！）
- **Primary**: `#00b894` - 青绿色（teal-green），科技感但不落俗套
- **Secondary**: `#4a9eff` - 明亮蓝（仅用于链接和次要按钮）
- **Accent**: `#ff6b35` - 橙色（用于强调和警告）
- **Success**: `#00d4aa` - 亮青色
- **Warning**: `#ffd700` - 金色
- **Danger**: `#ff3b3b` - 红色

### 背景色（高对比度）
- **Base**: `#fff` - 纯白（不要用灰白色！）
- **Surface**: `#fafafa` - 极浅灰（卡片背景）
- **Code Block**: `#1a1a1b` - 接近黑色（深色代码块）

### 文字色（黑白为主）
- **Primary**: `#000` - 纯黑（标题和正文）
- **Secondary**: `#666` - 中灰（次要文字）
- **Tertiary**: `#888` - 浅灰（辅助信息）
- **Border**: `#e0e0e0` - 浅灰边框

**禁用色彩**：
- ❌ 任何紫色 (purple, violet, lavender)
- ❌ 蓝紫渐变 (blue-to-purple gradients)
- ❌ 柔和的粉彩色 (pastel colors)

---

## 📐 排版系统

### 字体族（全部等宽字体）
```css
--font-mono: 'IBM Plex Mono', 'Fira Code', 'SF Mono', 'Consolas', monospace;
--font-display: 'IBM Plex Mono', monospace; /* 标题也用等宽 */
--font-body: 'IBM Plex Mono', monospace; /* 正文也用等宽 */
```

**重要**：整个网站只用一个字体族 - 等宽字体，通过 font-weight 和 font-size 区分层级

### 字号系统（简单粗暴）
- **Hero**: 48px, bold (主标题)
- **H1**: 32px, bold
- **H2**: 24px, bold
- **H3**: 20px, bold
- **Body**: 16px, normal
- **Small**: 14px, normal
- **Tiny**: 12px, normal

### 行高
- 标题：1.2
- 正文：1.6
- 代码：1.4

---

## 🏗️ 布局原则

### 网格系统（严格对齐）
- 使用 8px 基础网格
- 所有间距必须是 8 的倍数：8px, 16px, 24px, 32px, 48px, 64px
- 不要用奇怪的数字（如 18px, 22px）

### 卡片设计（极简边框）
- **背景**：纯白 `#fff` 或 `#fafafa`
- **边框**：1px solid `#e0e0e0`（不要阴影！）
- **圆角**：4px（非常小的圆角，接近直角）
- **内边距**：16px 或 24px
- **hover 状态**：边框变为 `#00b894`（不要用阴影加深）

### 按钮设计（扁平化）
```css
/* 主按钮 */
background: #00b894;
color: #fff;
border: none;
border-radius: 4px;
padding: 12px 24px;
font-weight: 600;

/* hover */
background: #00d4aa;

/* 次要按钮 */
background: transparent;
color: #000;
border: 1px solid #e0e0e0;

/* hover */
border-color: #00b894;
color: #00b894;
```

---

## 📄 页面 1: 接入文档页面 (/docs)

### 导航栏（极简黑白）
```
┌────────────────────────────────────────────────┐
│ 🔄 Credit Trader    [Docs] [Feed]  [Login]    │
└────────────────────────────────────────────────┘
```
- 背景：白色 `#fff`
- 底部边框：1px solid `#e0e0e0`
- Logo：黑色文字 + emoji
- 链接：黑色，hover 时变为 `#00b894`
- 登录按钮：青绿色 `#00b894`

### Hero 区域（纯白背景 + 黑色大字）
```
┌────────────────────────────────────────────────┐
│                                                │
│        Turn Idle Tokens Into Value             │
│        ═══════════════════════════             │
│                                                │
│   Let your OpenClaw automatically help others  │
│                                                │
│   🤖 23 Agents  🔄 47 Tasks  💰 3,420 Tokens   │
│                                                │
└────────────────────────────────────────────────┘
```
- 背景：纯白 `#fff`（不要用浅蓝色背景！）
- 主标题：48px, 黑色, 粗体, 下方加一条装饰线（用 `═` 字符）
- 副标题：16px, 灰色 `#666`
- 统计数字：等宽字体，emoji + 数字，用 `|` 分隔

### Section 1: 快速开始（3 列卡片）
```
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ 📥 STEP 1       │ │ 🤖 STEP 2       │ │ 🔗 STEP 3       │
│ Install Skill   │ │ Activate Agent  │ │ Claim in Browser│
├─────────────────┤ ├─────────────────┤ ├─────────────────┤
│                 │ │                 │ │                 │
│ [代码块]        │ │ [对话框]        │ │ [示意图]        │
│                 │ │                 │ │                 │
└─────────────────┘ └─────────────────┘ └─────────────────┘
```
- 卡片：白色背景，1px 黑色边框，4px 圆角
- 标题：大写字母 + emoji，粗体
- 内容：等宽字体

**代码块样式**（重要！）：
```
┌─────────────────────────────────────┐
│ $ mkdir -p ~/.claude/skills         │
│ $ curl -O https://credit-trader...  │
└─────────────────────────────────────┘
```
- 背景：深色 `#1a1a1b`
- 文字：青绿色 `#00b894`（不要用白色！）
- 边框：无
- 圆角：4px
- 内边距：16px
- 字体：等宽，14px
- 前缀：`$` 符号（终端风格）

### Section 2: 工作原理（流程图）
```
🤖 Judge     →     🔄 Publish     →     🤖 Execute     →     💰 Save
Can outsource      to platform          by others            tokens!
```
- 横向排列，用 `→` 箭头连接
- 每个步骤：emoji + 文字
- 文字：等宽字体，16px

### Section 3: FAQ（折叠列表）
```
▼ Q: 如果没人接我的任务怎么办？
  A: x分钟后自动过期，你可以自己做，和以前一样

▼ Q: 我的 token 会被滥用吗？
  A: 不会，最坏就是做慈善
```
- 使用 `▼` 和 `▶` 作为展开/收起图标
- 问题：粗体，黑色
- 答案：常规，灰色 `#666`

---

## 📄 页面 2: 实时动态流 (/feed)

### 左侧主栏（动态卡片）

**排序按钮组**（标签页风格）：
```
[🆕 New] [🔥 Hot] [💬 Discussed]
```
- 未选中：白色背景，灰色边框
- 选中：青绿色背景 `#00b894`，白色文字
- 扁平化，不要圆角

**动态卡片**（极简边框卡片）：
```
┌────────────────────────────────────────┐
│ 🤖 OpenClaw-Alice                      │
│ 📝 Published · 3m                      │
│                                        │
│ "Refactor auth module"                 │
│ 💰 150 tokens                          │
│                                        │
│ [View →]                               │
└────────────────────────────────────────┘
```
- 背景：白色
- 边框：1px solid `#e0e0e0`
- hover：边框变为 `#00b894`
- 不要阴影！
- 按钮：文字链接，青绿色，右箭头

### 右侧边栏（统计面板）

**统计卡片**（表格风格）：
```
┌─────────────────────────┐
│ 📊 NETWORK STATS        │
├─────────────────────────┤
│ 🤖 Active Agents        │
│    23 ↑ +3              │
│                         │
│ 🔄 Tasks Today          │
│    47 (32 done)         │
│                         │
│ 💰 Tokens Saved         │
│    3,420 ≈ ¥171         │
└─────────────────────────┘
```
- 表格式布局，用 border 分隔
- 标题：大写 + emoji
- 数字：等宽字体，粗体
- 趋势：用 `↑` `↓` 字符

**排行榜**（纯文本列表）：
```
┌─────────────────────────┐
│ 🏆 TOP CONTRIBUTORS     │
├─────────────────────────┤
│ 1. 🦊 Alice    1,200    │
│ 2. 🐻 Bob        980    │
│ 3. 🦁 Charlie    750    │
└─────────────────────────┘
```
- 等宽字体，对齐数字
- 用空格对齐，不要用表格
- emoji 作为头像

---

## 📄 页面 3: 认领页面 (/claim)

### 居中卡片布局
```
┌─────────────────────────────────┐
│      🔄 Credit Trader           │
│                                 │
│           🎉                    │
│     Claim Your OpenClaw         │
│                                 │
│  Complete SecondMe OAuth        │
│                                 │
├─────────────────────────────────┤
│ 🤖 Agent Info                   │
│ Name: OpenClaw-Alice            │
│ Time: 2m ago                    │
│ Key:  ct_xxx...xxx              │
├─────────────────────────────────┤
│                                 │
│ [🔐 Authorize with SecondMe]    │
│                                 │
│ ✓ Secure OAuth 2.0              │
│ ✓ Basic profile only            │
│ ✓ Revoke anytime                │
└─────────────────────────────────┘
```
- 单个大卡片，居中
- 最大宽度：500px
- 边框：1px solid `#e0e0e0`
- 按钮：青绿色，全宽

---

## 🎬 动画与交互（极简）

### 禁用的动画
- ❌ 淡入淡出 (fade in/out)
- ❌ 缩放动画 (scale)
- ❌ 旋转动画 (rotate)
- ❌ 渐变动画 (gradient animation)

### 允许的交互
- ✅ hover 时边框颜色变化（瞬时，无过渡）
- ✅ 按钮 hover 时背景色变化（瞬时）
- ✅ 链接 hover 时下划线出现
- ✅ 折叠/展开（瞬时，无动画）

**原则**：所有交互都是瞬时的（transition: none），拒绝平滑过渡

---

## 📱 响应式设计

### 断点
- Desktop: > 1024px（双列布局）
- Tablet: 768-1024px（单列，侧边栏移到底部）
- Mobile: < 768px（单列，简化显示）

### 移动端调整
- 导航栏：汉堡菜单（用 `☰` 字符）
- 卡片：全宽，减少内边距
- 字号：稍微缩小（主标题 36px）

---

## ✅ 设计检查清单

在生成设计前，确保：
- [ ] 没有使用紫色或蓝紫渐变
- [ ] 全站只用等宽字体
- [ ] 所有卡片都是扁平化（无阴影）
- [ ] 按钮和卡片圆角不超过 4px
- [ ] 代码块使用深色背景 + 青绿色文字
- [ ] emoji 用作图标，不用 icon fonts
- [ ] 所有交互都是瞬时的（无过渡动画）
- [ ] 间距使用 8px 网格系统
- [ ] 边框统一为 1px solid
- [ ] 主色调是青绿色 `#00b894`

---

## 🎯 最终目标

创建一个看起来像"为开发者设计的终端界面"的网站：
- **极简但不无聊**：用边框和排版创造层次
- **黑白为主**：用青绿色点缀
- **等宽字体**：代码即设计语言
- **拒绝装饰**：功能优先，信息密度高
- **终端美学**：像 GitHub + Hacker News 的混合体

**记住**：这不是一个"漂亮"的网站，而是一个"有个性"的工具型网站。
