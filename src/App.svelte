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
      appReady = true;
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
</svelte:head>

<main class="min-h-screen w-full bg-base-200 dark:bg-base-200-dark text-neutral dark:text-neutral-dark font-sans transition-colors duration-200">
  <Header />
  
  <div class="container mx-auto px-4 py-6">
    {#if appReady && editorVisible}
      <BasicEditor />
    {:else}
      <div class="w-full h-[calc(100vh-200px)] flex items-center justify-center">
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
</style> 