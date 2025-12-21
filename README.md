# VPS 剩余价值计算器

一个简洁易用的 VPS 剩余价值计算工具，帮助你在购买或出售二手 VPS 时准确计算剩余价值和溢价。

## 🚀 一键部署

点击下方按钮即可一键部署到 Cloudflare Pages：

[![Deploy to Cloudflare Pages](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/lainbo/vps-residual-calculator)

## 🛠️ 技术栈

- **框架**: [Vite](https://vitejs.dev/) - 快速的构建工具
- **UI 框架**: [Alpine.js](https://alpinejs.dev/) - 轻量级响应式框架
- **样式**: [Tailwind CSS](https://tailwindcss.com/) - 实用优先的 CSS 框架
- **精确计算**: [Decimal.js](https://github.com/MikeMcl/decimal.js/) - 高精度数值计算

## 📦 本地开发

### 前置要求

- Node.js >= 16
- pnpm (推荐) 或 npm

### 安装依赖

```bash
# 使用 pnpm
pnpm install

# 或使用 npm
npm install
```

### 启动开发服务器

```bash
# 使用 pnpm
pnpm dev

# 或使用 npm
npm run dev
```

访问 `http://localhost:5173` 查看应用。

### 构建生产版本

```bash
# 使用 pnpm
pnpm build

# 或使用 npm
npm run build
```

构建产物将生成在 `dist` 目录。

### 预览生产版本

```bash
# 使用 pnpm
pnpm preview

# 或使用 npm
npm run preview
```

## 📖 使用说明

### 购买模式

1. 选择"我要购买"模式
2. 填写续费金额和选择币种
3. 填写到期时间和付款周期
4. 输入对方出价（CNY）
5. 填写交易日期
6. 点击"计算结果"查看剩余价值和溢价

### 出售模式

1. 选择"我要出售"模式
2. 填写续费金额和选择币种
3. 填写到期时间和付款周期
4. 输入期望溢价（CNY）
5. 填写交易日期
6. 点击"计算结果"查看建议售价

## 🌐 部署指南

### Cloudflare Pages

1. 点击上方的"Deploy to Cloudflare Pages"按钮
2. 授权 GitHub 账号
3. 选择仓库并确认部署
4. 等待构建完成即可访问

构建配置：
- **构建命令**: `npm run build`
- **构建输出目录**: `dist`
- **Node 版本**: 16 或更高

### 其他平台

本项目是纯静态网站，可以部署到任何支持静态网站托管的平台：

- **Vercel**: 导入 GitHub 仓库，自动识别配置
- **Netlify**: 拖拽 `dist` 目录或连接 Git 仓库
- **GitHub Pages**: 推送 `dist` 目录到 `gh-pages` 分支

## 📄 License

[ISC License](LICENSE)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

如果这个项目对你有帮助，欢迎给个 ⭐️！
