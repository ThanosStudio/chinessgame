# 迁移指南：从 Google Gemini 到 OpenRouter

## 变更内容

### 1. 环境变量变更

**之前：**
```bash
GEMINI_API_KEY=your_google_api_key
```

**现在：**
```bash
OPENROUTER_API_KEY=your_openrouter_api_key
```

### 2. 获取 API Key

1. 访问 [OpenRouter](https://openrouter.ai)
2. 注册/登录账户
3. 进入 [API Keys](https://openrouter.ai/keys) 页面
4. 创建新的 API Key
5. 复制 API Key

### 3. 更新 Vercel 环境变量

1. 登录 Vercel Dashboard
2. 进入项目 Settings > Environment Variables
3. 删除旧的 `GEMINI_API_KEY`（如果存在）
4. 添加新的 `OPENROUTER_API_KEY`
5. 重新部署项目

### 4. 本地开发

更新 `.env` 文件：
```bash
# 删除或注释掉旧的
# GEMINI_API_KEY=...

# 添加新的
OPENROUTER_API_KEY=your_openrouter_api_key
```

### 5. 代码变更

- ✅ 已移除 `@google/generative-ai` 依赖
- ✅ 改用 OpenRouter REST API
- ✅ 使用 `google/gemini-2.0-flash-exp` 模型
- ✅ 所有日志前缀从 `[Gemini]` 改为 `[OpenRouter]`

### 6. 模型名称

当前使用的模型：`google/gemini-2.0-flash-exp`

如果需要使用其他版本，可以在 `lib/gemini.ts` 中修改：
- `google/gemini-2.0-flash` - 稳定版
- `google/gemini-2.0-flash-exp` - 实验版（当前使用）

查看所有可用模型：https://openrouter.ai/models

## 优势

1. **统一接口**：OpenRouter 提供统一的 API 访问多个模型
2. **更灵活**：可以轻松切换不同的 AI 模型
3. **更好的定价**：OpenRouter 可能提供更优惠的价格
4. **无需 SDK**：直接使用 HTTP 请求，减少依赖

## 测试

部署后，检查日志应该看到：
```
[OpenRouter] Generating challenge for day XXX...
[OpenRouter] Received response, length: XXX
[OpenRouter] Successfully generated challenge for day XXX
```

如果看到错误，检查：
1. API Key 是否正确设置
2. API Key 是否有足够的余额
3. 模型名称是否正确

