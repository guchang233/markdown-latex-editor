import App from './App.svelte';
import '@unocss/reset/tailwind.css';
import 'uno.css';
// 已在index.html中通过CDN加载KaTeX
// import 'katex/dist/katex.min.css';
import 'prismjs/themes/prism-tomorrow.css';

// 向用户展示运行信息
console.info(`
===========================================
MarkTeX 编辑器启动
===========================================
如果您无法通过 npm run dev 运行应用，可能是 PowerShell 安全策略问题。
请尝试以下方法之一：

1. 使用 CMD 而不是 PowerShell 运行命令：
   cmd /c "npm run dev"

2. 以管理员身份运行 PowerShell 并执行：
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   
3. 双击打开 index.html 文件直接在浏览器中运行
===========================================
`);

// 增强控制台错误处理
const originalConsoleError = console.error;
console.error = function(...args) {
  // 过滤掉浏览器扩展相关错误
  const errorMsg = args[0]?.toString() || '';
  
  // 编辑器初始化错误处理
  if (errorMsg.includes('Editor instance not initialized')) {
    // 将其重定向到我们的自定义错误处理
    console.warn('编辑器正在初始化中，请稍候再试...');
    
    // 如果UI中有加载指示器，可以在这里增强其可见性
    const loadingIndicator = document.querySelector('.editor-loading-indicator');
    if (loadingIndicator && loadingIndicator instanceof HTMLElement) {
      loadingIndicator.style.display = 'block';
    }
    
    return; // 不要将此错误传递给原始控制台
  }
  
  if (
    errorMsg.includes('Receiving end does not exist') ||
    errorMsg.includes('videoInWhiteList') ||
    errorMsg.includes('WebAssembly.instantiate')
  ) {
    // 抑制这些与应用无关的错误
    return;
  }
  
  // 其他错误正常显示
  originalConsoleError.apply(console, args);
};

// 创建一个通用错误处理器，以便捕获和显示任何启动错误
window.addEventListener('error', (event) => {
  // 检查是否为编辑器相关错误
  if (event.message && event.message.includes('Editor')) {
    event.preventDefault(); // 防止默认错误处理
    
    console.warn('编辑器初始化问题：', event.message);
    
    // 如果UI中已经有错误显示，不重复显示
    if (document.querySelector('.editor-error-message')) {
      return;
    }
    
    // 只在控制台显示错误，不打扰用户体验
    return;
  }
  
  // 其他严重错误才显示UI错误消息
  const errorContainer = document.createElement('div');
  errorContainer.style.position = 'fixed';
  errorContainer.style.top = '10px';
  errorContainer.style.left = '10px';
  errorContainer.style.right = '10px';
  errorContainer.style.padding = '20px';
  errorContainer.style.backgroundColor = '#ffebee';
  errorContainer.style.border = '1px solid #ef5350';
  errorContainer.style.borderRadius = '4px';
  errorContainer.style.zIndex = '9999';
  errorContainer.innerHTML = `
    <h3 style="margin-top: 0; color: #d32f2f;">应用程序启动错误</h3>
    <p><strong>错误信息:</strong> ${event.message || '未知错误'}</p>
    <p><strong>解决方案:</strong></p>
    <ol>
      <li>请确保已运行 fix-project.js 脚本: <code>node fix-project.js</code></li>
      <li>尝试使用 CMD 而不是 PowerShell 运行: <code>cmd /c "npm run dev"</code></li>
      <li>清除浏览器缓存后重试</li>
      <li>检查浏览器控制台获取更多详细信息</li>
    </ol>
    <button style="padding: 8px 16px; background-color: #d32f2f; color: white; border: none; border-radius: 4px; cursor: pointer;" onclick="this.parentNode.remove()">关闭</button>
  `;
  document.body.appendChild(errorContainer);
});

// Remove initial loader
const initialLoader = document.querySelector('.initial-loader');
if (initialLoader) {
  // Add fade-out effect
  initialLoader.classList.add('opacity-0');
  
  // Apply style with type assertion
  if (initialLoader instanceof HTMLElement) {
    initialLoader.style.transition = 'opacity 0.3s ease-out';
  }
  
  // Remove after animation completes
  setTimeout(() => {
    initialLoader.remove();
  }, 300);
}

// Initialize the application
const app = new App({
  target: document.getElementById('app') as HTMLElement,
});

export default app; 