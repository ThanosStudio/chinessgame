# 本地测试指南

## 快速测试

### 1. 启动开发服务器

```bash
npm run dev
```

### 2. 运行测试脚本

```bash
./test-api-local.sh
```

或者直接测试 API：

```bash
curl "http://localhost:3000/api/challenge?t=$(date +%s)" \
  -H "Cache-Control: no-cache"
```

### 3. 查看日志

在运行 `npm run dev` 的终端中，你应该能看到：

**成功的情况：**
```
[API] Request for challenge - Date: 2024-12-25, Day: 725
[API] Generating new challenge for day 725...
[Gemini] Generating challenge for day 725...
[Gemini] Received response, length: 1234
[Gemini] Successfully generated challenge for day 725
[API] Caching generated challenge for 2024-12-25
```

**失败的情况（返回默认挑战）：**
```
[API] Request for challenge - Date: 2024-12-25, Day: 725
[API] Generating new challenge for day 725...
[Gemini] Generating challenge for day 725...
[Gemini] Error generating challenge: [错误信息]
[API] Failed to generate challenge, using default
[API] Not caching default challenge
```

## 当前修复状态

✅ **已修复的问题：**
1. 模型名称从 `gemini-1.5-flash` 改为 `gemini-pro`（更兼容）
2. 添加了详细的日志输出
3. 禁用了 Vercel CDN 缓存
4. 添加了环境变量检查

⚠️ **可能的问题：**
1. 本地网络可能无法访问 Google API（需要代理或 VPN）
2. API Key 可能无效或权限不足
3. 模型名称可能需要根据你的 API Key 类型调整

## 验证 API Key

检查 `.env` 文件中的 API Key 是否正确：

```bash
grep GEMINI_API_KEY .env
```

API Key 应该：
- 长度约 39 个字符
- 格式类似：`AIzaSy...`
- 从 [Google AI Studio](https://makersuite.google.com/app/apikey) 获取

## 下一步

1. **如果本地测试成功**：代码应该可以在 Vercel 上正常工作
2. **如果本地返回默认挑战**：
   - 检查网络连接（可能需要代理）
   - 验证 API Key 是否有效
   - 查看终端中的详细错误信息

3. **部署到 Vercel 后**：
   - 确保在 Vercel 环境变量中设置了 `GEMINI_API_KEY`
   - 查看 Vercel Functions 日志确认模型是否可用
   - 如果还是 404 错误，可能需要尝试其他模型名称

## 可用的模型名称（按优先级）

如果 `gemini-pro` 不工作，可以尝试：

1. `gemini-pro` - 最稳定，v1 API
2. `gemini-1.5-pro` - 1.5 版本，可能需要 v1beta
3. `gemini-1.5-flash` - Flash 版本，可能需要 v1beta

修改 `lib/gemini.ts` 第 95 行的模型名称即可。

