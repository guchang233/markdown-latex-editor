# MarkTeX 编辑器安装指南

本文档提供了安装和运行 MarkTeX 编辑器的详细步骤。

## 系统要求

- **Node.js**: 14.0.0 或更高版本
- **npm**: 7.0.0 或更高版本
- **现代浏览器**: Chrome, Firefox, Edge, Safari (最新版本)
- **最小分辨率**: 1280px 宽度

## 安装步骤

### 1. 克隆或下载代码库

```bash
git clone https://github.com/yourusername/markdown-latex-editor.git
cd markdown-latex-editor
```

### 2. 安装依赖

```bash
npm install
```

这将安装所有必需的依赖，包括：
- Svelte 框架
- CodeMirror 6 编辑器
- KaTeX 数学公式渲染库
- Remarkable Markdown 解析器
- Prism.js 代码高亮
- UnoCSS 样式工具

### 3. 解决可能的类型定义问题

如果您遇到类型定义错误，请安装以下开发依赖：

```bash
npm install --save-dev @types/node
```

### 4. 启动开发服务器

```bash
npm run dev
```

这将启动一个本地开发服务器，通常在 http://localhost:5173 可以访问。

### 5. 构建生产版本

```bash
npm run build
```

构建完成后，生产文件将位于 `dist` 目录中。

### 6. 预览生产版本

```bash
npm run preview
```

## 配置选项

### 主题配置

您可以在 `uno.config.ts` 文件中修改主题颜色和样式：

```typescript
// uno.config.ts
export default defineConfig({
  theme: {
    colors: {
      // 修改亮色主题颜色
      primary: '#YOUR_COLOR',
      // 修改暗色主题颜色
      'primary-dark': '#YOUR_DARK_COLOR',
    }
  }
});
```

### 自定义初始文档

修改 `src/stores/document.ts` 中的 `initialState` 对象：

```typescript
const initialState: DocumentState = {
  currentContent: '# 您的自定义初始内容',
  // ...其他属性
};
```

## 故障排除

### 类型错误

如果遇到类型错误，请确保已安装所有必要的类型定义：

```bash
npm install --save-dev @types/node @tsconfig/svelte
```

然后修复 `tsconfig.json` 中的 `moduleResolution` 设置：

```json
{
  "compilerOptions": {
    "moduleResolution": "Node"
    // 其他选项...
  }
}
```

### Web Worker 路径问题

如果 Web Worker 无法加载，请检查 `src/utils/workerUtils.ts` 中的路径：

```typescript
this.worker = new Worker('/workers/markdown-worker.js');
// 可能需要修改为：
// this.worker = new Worker('./workers/markdown-worker.js');
```

## 部署指南

### 静态托管

1. 执行构建命令：`npm run build`
2. 将 `dist` 目录上传到您选择的静态托管服务（如 Netlify, Vercel, GitHub Pages）

### Docker 部署

我们提供了一个基本的 Dockerfile 配置：

```dockerfile
FROM node:16-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

构建和运行 Docker 镜像：

```bash
docker build -t marktex-editor .
docker run -p 8080:80 marktex-editor
```

## 支持和反馈

如有问题或建议，请通过以下方式联系：

- 提交 GitHub Issue
- 发送邮件至: support@example.com

感谢您使用 MarkTeX 编辑器！ 