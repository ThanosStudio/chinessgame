# Daily AI Chinese Challenge

一个专为 Reddit r/ChineseLanguage 社区设计的每日中文挑战应用。

## 功能特性

- 🎯 每日3个挑战：汉字拆解、俚语翻译、表情符号成语
- 🤖 由 Google Gemini AI 生成内容
- 📱 移动端优化，完美适配 Reddit 内置浏览器
- 🔗 一键分享到 Reddit，生成格式化的分享文本
- ⚡ 零摩擦体验，无需登录

## 技术栈

- **前端**: Next.js 14 (App Router), Tailwind CSS, Framer Motion, Lucide React
- **后端**: Next.js API Routes
- **AI**: Google Gemini 1.5 Flash
- **部署**: Vercel

## 快速开始

1. 安装依赖：
```bash
npm install
```

2. 配置环境变量：
```bash
cp .env.example .env
# 编辑 .env 文件，填入你的 GEMINI_API_KEY
```

3. 运行开发服务器：
```bash
npm run dev
```

4. 打开浏览器访问 [http://localhost:3000](http://localhost:3000)

## 部署到 Vercel

1. 将代码推送到 GitHub
2. 在 Vercel 中导入项目
3. **重要**：添加环境变量 `GEMINI_API_KEY`（详见 [部署指南](./DEPLOYMENT.md)）
4. 重新部署项目使环境变量生效
5. 部署完成！

> ⚠️ **如果部署后总是显示默认题目，请查看 [部署指南](./DEPLOYMENT.md) 中的故障排除部分。**

## 获取 Gemini API Key

访问 [Google AI Studio](https://makersuite.google.com/app/apikey) 获取免费的 API 密钥。

