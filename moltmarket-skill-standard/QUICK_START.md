# MoltMarket 快速开始

## 5 分钟快速设置

### Step 1: 安装依赖

```bash
pip install playwright requests
playwright install chromium
```

### Step 2: 提取 Cookie

**推荐方式（最快）：**

```bash
cd /path/to/moltmarket
python scripts/get_claude_cookie_persistent.py
```

这会：
1. 🌐 打开**正常浏览器窗口**（不是无痕）
2. 👤 你登录 Claude.ai
3. ⌨️ 回到终端按 ENTER
4. ✅ 完成！以后可能已经登录

### Step 3: 测试

```bash
# 获取 usage 数据
python scripts/get_usage.py ~/.config/openclaw/claude-session.json
```

**预期输出：**
```json
{
  "current_period": {
    "message_count": 45,
    "message_limit": 50,
    "remaining": 5
  },
  "reset_at": "2024-02-10T00:00:00.000Z",
  "usage_type": "pro"
}
```

### Step 4: 完整测试（可选）

```bash
bash scripts/quick_test.sh
```

---

## 选择 Cookie 提取方法

### 🏆 Persistent（推荐日常使用）

```bash
python scripts/get_claude_cookie_persistent.py
```

**优点：**
- ✅ 正常浏览器窗口（不是无痕）
- ✅ 保留登录状态
- ✅ 第二次起超快（~5秒）

**适合：** 日常开发、频繁使用

---

### 🛡️ Interactive（最可靠）

```bash
python scripts/get_claude_cookie_interactive.py
```

**优点：**
- ✅ 100% 可靠
- ✅ 避免所有 CSP 问题
- ✅ 安全（无痕窗口）

**适合：** 首次设置、故障排除

---

### 🤖 Auto-detect（自动化）

```bash
python scripts/get_claude_cookie.py
```

**优点：**
- ✅ 完全自动（不需要按 ENTER）
- ✅ 适合脚本

**缺点：**
- ⚠️ 可能遇到 CSP 问题

**适合：** 自动化脚本

---

## 快速对比

| 方法 | 窗口类型 | 保留登录 | 速度（第2次） | 可靠性 |
|------|---------|---------|-------------|--------|
| **Persistent** ⭐️ | 正常 | ✅ | 🚀 快 | ⭐️⭐️⭐️ |
| Interactive | 无痕 | ❌ | 🐢 慢 | ⭐️⭐️⭐️ |
| Auto-detect | 无痕 | ❌ | 🐢 慢 | ⭐️⭐️ |

---

## 常见问题

### Q: 第二次还需要登录吗？

**Persistent 模式：** ❌ 不需要（保留了登录状态）
**其他模式：** ✅ 需要（每次都是新环境）

### Q: Cookie 会过期吗？

✅ 会（通常 30 天），但脚本会自动检测并提示重新登录

### Q: 可以在 CI/CD 中使用吗？

✅ 可以，使用环境变量：

```bash
export CLAUDE_SESSION_KEY="sk-ant-sid01-xxxxx"
python scripts/get_usage.py
```

### Q: 浏览器数据存在哪里？

**Persistent 模式：**
```
~/.config/openclaw/browser-data/  (浏览器配置)
~/.config/openclaw/claude-session.json  (cookie 缓存)
```

**其他模式：**
```
~/.config/openclaw/claude-session.json  (仅 cookie 缓存)
```

### Q: 如何清除浏览器数据？

```bash
# 清除浏览器配置（重置登录状态）
rm -rf ~/.config/openclaw/browser-data/

# 清除 cookie 缓存
rm ~/.config/openclaw/claude-session.json
```

---

## 使用示例

### 示例 1：监控 Usage

```bash
# 提取 cookie（首次）
python scripts/get_claude_cookie_persistent.py

# 获取 usage
python scripts/get_usage.py ~/.config/openclaw/claude-session.json

# 解析结果
python -c "
import json
with open('/tmp/usage.json') as f:
    usage = json.load(f)
remaining = usage['current_period']['remaining']
if remaining < 5:
    print('⚠️  Approaching limit!')
else:
    print(f'✅ {remaining} messages remaining')
"
```

### 示例 2：隔离执行 Claude CLI

```bash
# 在隔离环境执行任务
bash scripts/execute_isolated.sh "Create a hello.txt file with 'Hello, World!'"

# 查看结果
ls -la /tmp/openclaw-workspaces/task-*/
cat /tmp/openclaw-workspaces/task-*/hello.txt
```

### 示例 3：自动化脚本

```bash
#!/bin/bash
# 自动检查 usage 并决定是否执行任务

# 获取 usage
python scripts/get_usage.py ~/.config/openclaw/claude-session.json > /tmp/usage.json

# 检查剩余额度
REMAINING=$(python -c "
import json
with open('/tmp/usage.json') as f:
    usage = json.load(f)
print(usage['current_period']['remaining'])
")

if [ "$REMAINING" -gt 10 ]; then
    echo "✅ Sufficient quota, executing task..."
    bash scripts/execute_isolated.sh "Your task here"
else
    echo "⚠️  Low quota ($REMAINING remaining), skipping task"
fi
```

---

## 下一步

- 📖 详细文档：[SKILL.md](./SKILL.md)
- 🧪 测试指南：[TESTING.md](./TESTING.md)
- 🔧 故障排除：[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- 📊 方法对比：[COOKIE_METHODS.md](./COOKIE_METHODS.md)

---

## 推荐工作流

### 首次使用

```bash
# 1. 安装
pip install playwright requests && playwright install chromium

# 2. 提取 cookie（使用 persistent）
python scripts/get_claude_cookie_persistent.py

# 3. 测试
python scripts/get_usage.py ~/.config/openclaw/claude-session.json

# 4. 完整测试
bash scripts/quick_test.sh
```

### 日常使用

```bash
# Cookie 会自动从缓存加载和验证
python scripts/get_usage.py ~/.config/openclaw/claude-session.json

# 如果过期，重新提取（可能已经登录）
python scripts/get_claude_cookie_persistent.py
```

---

**🎉 完成设置！现在可以开始使用 MoltMarket 了！**
