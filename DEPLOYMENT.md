# 部署指南

## 问题诊断

如果部署后总是显示默认题目，通常是因为 **Gemini API Key 未正确配置**。

## 解决步骤

### 1. 获取 Gemini API Key

1. 访问 [Google AI Studio](https://makersuite.google.com/app/apikey)
2. 登录你的 Google 账号
3. 点击 "Create API Key" 创建新的 API 密钥
4. 复制生成的 API Key（格式类似：`AIzaSy...`）

### 2. 在 Vercel 中配置环境变量

#### 方法一：通过 Vercel Dashboard

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 选择你的项目
3. 进入 **Settings** > **Environment Variables**
4. 添加新的环境变量：
   - **Name**: `GEMINI_API_KEY`
   - **Value**: 你刚才复制的 API Key
   - **Environment**: 选择 `Production`, `Preview`, `Development`（建议全选）
5. 点击 **Save**
6. **重要**：重新部署项目（Redeploy）使环境变量生效

#### 方法二：通过 Vercel CLI

```bash
vercel env add GEMINI_API_KEY
# 输入你的 API Key
# 选择环境：Production, Preview, Development
```

然后重新部署：
```bash
vercel --prod
```

### 3. 验证配置

部署后，检查 Vercel 的 Function Logs：

1. 在 Vercel Dashboard 中，进入你的项目
2. 点击 **Deployments** 标签
3. 选择最新的部署
4. 点击 **Functions** 标签
5. 查看 `/api/challenge` 的日志

**正常情况**应该看到：
```
[API] Request for challenge - Date: 2024-XX-XX, Day: XXX
[API] Generating new challenge for day XXX...
[Gemini] Generating challenge for day XXX...
[Gemini] Received response, length: XXX
[Gemini] Successfully generated challenge for day XXX
[API] Caching generated challenge for 2024-XX-XX
```

**如果 API Key 未设置**，会看到：
```
Error: GEMINI_API_KEY environment variable is not set. Please set it in your Vercel environment variables.
```

**如果 API Key 无效**，会看到：
```
[Gemini] Error generating challenge: API key not valid
```

### 4. 测试 API

部署后，可以直接访问 API 端点测试：

```
https://your-project.vercel.app/api/challenge
```

应该返回 JSON 格式的挑战数据，而不是错误信息。

## 常见问题

### Q: 为什么还是显示默认题目？

**A:** 可能的原因：
1. 环境变量未设置或设置错误
2. 环境变量设置了但没有重新部署
3. API Key 无效或已过期
4. Gemini API 配额用尽

**解决方法**：
- 检查 Vercel 环境变量是否正确设置
- 重新部署项目
- 验证 API Key 是否有效
- 检查 Google AI Studio 中的 API 使用情况

### Q: 如何清除缓存？

**A:** 缓存基于日期，每天自动更新。如果需要立即清除：
- 等待到第二天（UTC 时间）
- 或者修改代码中的 `CACHE_DURATION` 为更短的时间

### Q: 如何查看详细的错误日志？

**A:** 
1. 在 Vercel Dashboard 中查看 Function Logs
2. 或者在代码中添加更多 `console.log` 语句
3. 使用 Vercel 的实时日志功能

## 调试技巧

1. **检查环境变量**：在 API 路由中添加临时日志
```typescript
console.log('API Key exists:', !!process.env.GEMINI_API_KEY);
console.log('API Key length:', process.env.GEMINI_API_KEY?.length);
```

2. **测试 API Key**：使用 curl 或 Postman 直接测试 Gemini API

3. **查看网络请求**：在浏览器开发者工具中查看 `/api/challenge` 的响应

## 安全提示

- ⚠️ **不要**将 API Key 提交到 Git 仓库
- ✅ 使用 `.env.local` 进行本地开发
- ✅ 使用 Vercel 环境变量进行生产部署
- ✅ 定期轮换 API Key

