<script lang="ts">
  import { onMount } from 'svelte';
  import BasicEditor from './components/BasicEditor.svelte';
  import Header from './components/Header.svelte';
  import Footer from './components/Footer.svelte';
  import ThemeToggle from './components/ThemeToggle.svelte';
  import { themeStore } from './stores/theme';
  
  let appReady = false;
  let editorVisible = false;
  
  // 检测KaTeX是否已加载
  function checkKaTeXLoaded() {
    return typeof window !== 'undefined' && window.katex !== undefined;
  }
  
  // 加载KaTeX库
  function loadKaTeX() {
    // 如果已加载，直接返回
    if (checkKaTeXLoaded()) {
      appReady = true;
      return;
    }
    
    // 加载KaTeX CSS
    const katexCSS = document.createElement('link');
    katexCSS.rel = 'stylesheet';
    katexCSS.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.4/dist/katex.min.css';
    document.head.appendChild(katexCSS);
    
    // 加载KaTeX JavaScript
    const katexScript = document.createElement('script');
    katexScript.src = 'https://cdn.jsdelivr.net/npm/katex@0.16.4/dist/katex.min.js';
    katexScript.async = true;
    katexScript.onload = () => {
      // KaTeX加载完成后，加载auto-render扩展
      const autoRenderScript = document.createElement('script');
      autoRenderScript.src = 'https://cdn.jsdelivr.net/npm/katex@0.16.4/dist/contrib/auto-render.min.js';
      autoRenderScript.async = true;
      autoRenderScript.onload = () => {
        // 配置KaTeX自动渲染
        if (window.renderMathInElement) {
          window.renderMathInElement(document.body, {
            delimiters: [
              {left: '$$', right: '$$', display: true},
              {left: '$', right: '$', display: false}
            ]
          });
        }
        appReady = true;
      };
      document.head.appendChild(autoRenderScript);
    };
    
    document.head.appendChild(katexScript);
  }
  
  // 加载字体
  function loadFonts() {
    const fontLink = document.createElement('link');
    fontLink.rel = 'stylesheet';
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap';
    document.head.appendChild(fontLink);
  }
  
  onMount(() => {
    console.log('App组件已挂载');
    
    // 初始化主题
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      document.documentElement.classList.add('dark');
    }
    
    // 加载必要资源
    loadFonts();
    loadKaTeX();
    
    // 在应用准备就绪后，延迟显示编辑器
    const checkAppReady = setInterval(() => {
      if (appReady) {
        clearInterval(checkAppReady);
        // 延迟 300ms 后显示编辑器，确保所有状态都已正确初始化
        setTimeout(() => {
          editorVisible = true;
        }, 300);
      }
    }, 100);
  });
  
  // Subscribe to theme changes
  $: if ($themeStore.theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
</script>

<svelte:head>
  <title>MarkTeX - Markdown & LaTeX 编辑器</title>
  <meta name="description" content="MarkTeX是一个强大的Markdown和LaTeX公式编辑器，支持实时预览和多种导出格式。">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.4/dist/katex.min.css">
  <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.4/dist/katex.min.js"></script>
</svelte:head>

<main class="min-h-screen h-screen flex flex-col w-full bg-base-200 dark:bg-base-200-dark text-neutral dark:text-neutral-dark font-sans transition-colors duration-200 overflow-hidden">
  <Header />
  
  <div class="flex-grow overflow-auto" id="app-main-container">
    {#if appReady && editorVisible}
      <BasicEditor />
    {:else}
      <div class="w-full h-full flex items-center justify-center">
        <div class="spinner"></div>
      </div>
    {/if}
  </div>
  
  <div class="fixed bottom-6 right-6 z-50">
    <ThemeToggle />
  </div>
  
  <Footer />
</main>

<style>
  /* App-specific styles can be added here if needed */
  :global(:root) {
    --color-base-100: #ffffff;
    --color-base-200: #f8fafc;
    --color-base-300: #e5e7eb;
    --color-text: #1f2937;
    --color-text-muted: #6b7280;
    
    --color-base-100-dark: #1e293b;
    --color-base-200-dark: #0f172a;
    --color-base-300-dark: #374151;
    --color-text-dark: #f3f4f6;
    --color-text-muted-dark: #9ca3af;
    
    --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    
    --radius: 0.375rem;
  }
</style> 