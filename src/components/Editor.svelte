<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { themeStore } from '../stores/theme';
  import { documentStore } from '../stores/document';
  import { settingsStore } from '../stores/settings';
  import MarkdownToolbar from './MarkdownToolbar.svelte';
  import { renderMarkdown } from '../utils/markdown';
  import SettingsDialog from './SettingsDialog.svelte';
  
  // 导入编辑器助手函数
  import { createEditor, createFallbackEditor, showFallbackNotice } from '../utils/codeEditorHelper';
  
  // Import CodeMirror packages directly instead of dynamic imports
  import { EditorState } from '@codemirror/state';
  import { EditorView } from '@codemirror/view';
  import { markdown } from '@codemirror/lang-markdown';
  import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
  import { syntaxHighlighting, defaultHighlightStyle } from '@codemirror/language';
  
  // Editor and preview elements
  let editorContainer: HTMLElement;
  let previewContainer: HTMLElement;
  
  // State variables
  let editorInstance: EditorView | null = null;
  let workerInstance: Worker | null = null;
  let previewContent = '';
  let lastScrollPosition = 0;
  let isScrolling = false;
  let showSettingsDialog = false;
  let editorReady = false;
  
  // 记录编辑器状态变化
  $: {
    console.log(`Editor component: editorReady = ${editorReady}`);
  }
  
  // 默认内容，以防文档存储未加载
  const defaultContent = `# 欢迎使用 MarkTeX 编辑器

这是一个**高性能**的 Markdown 和 LaTeX 编辑器。

## 特点

- 实时预览
- Markdown 语法高亮
- LaTeX 数学公式渲染: $E = mc^2$
- 代码高亮

\`\`\`javascript
console.log("Hello, world!");
\`\`\`

## 数学公式示例

$$
\\int_{a}^{b} f(x) \\, dx = F(b) - F(a)
$$

## 表格示例

| 表头 1 | 表头 2 | 表头 3 |
|--------|--------|--------|
| 单元格 1 | 单元格 2 | 单元格 3 |
| 单元格 4 | 单元格 5 | 单元格 6 |

## 任务列表

- [x] 创建编辑器
- [ ] 添加更多功能
- [ ] 与大家分享
`;

  // Initialize Editor - Using textarea directly without CodeMirror
  async function initEditor(retryCount = 0, maxRetries = 3) {
    console.log(`Starting editor initialization (attempt ${retryCount + 1}/${maxRetries + 1})...`);
    
    // 设置初始化状态
    editorReady = false;
    
    try {
      if (!editorContainer) {
        console.error('Editor container not found');
        if (retryCount < maxRetries) {
          console.log(`Container not found, retrying in 200ms...`);
          setTimeout(() => initEditor(retryCount + 1, maxRetries), 200);
          return false;
        }
        return false;
      }
      
      console.log('Creating textarea editor...');
      
      // 确保有内容
      if (!$documentStore.currentContent) {
        documentStore.updateContent(defaultContent);
      }
      
      // 清空容器
      editorContainer.innerHTML = '';
      
      // 创建基本的文本编辑器
      const textarea = document.createElement('textarea');
      textarea.value = $documentStore.currentContent || defaultContent;
      textarea.style.width = '100%';
      textarea.style.height = '100%';
      textarea.style.padding = '16px';
      textarea.style.border = 'none';
      textarea.style.resize = 'none';
      textarea.style.fontFamily = 'monospace';
      textarea.style.fontSize = `${$settingsStore.fontSize || 16}px`;
      textarea.style.lineHeight = `${$settingsStore.lineHeight || 1.5}`;
      textarea.style.outline = 'none';
      
      // 设置颜色方案
      const isDarkMode = document.documentElement.classList.contains('dark');
      if (isDarkMode) {
        textarea.style.color = 'var(--color-text-dark, #e0e0e0)';
        textarea.style.backgroundColor = 'var(--color-bg-dark, #1e1e1e)';
      } else {
        textarea.style.color = 'var(--color-text-light, #333333)';
        textarea.style.backgroundColor = 'var(--color-bg-light, #ffffff)';
      }
      
      // 添加内容更新事件处理器
      textarea.addEventListener('input', (e) => {
        const content = e.target.value;
        documentStore.updateContent(content);
        updatePreview(content);
      });
      
      // 添加按键处理
      textarea.addEventListener('keydown', (e) => {
        // Tab 键处理
        if (e.key === 'Tab') {
          e.preventDefault();
          const start = textarea.selectionStart;
          const end = textarea.selectionEnd;
          
          // 插入 tab 字符
          textarea.value = textarea.value.substring(0, start) + '  ' + textarea.value.substring(end);
          
          // 移动光标到插入后的位置
          textarea.selectionStart = textarea.selectionEnd = start + 2;
          
          // 更新内容
          documentStore.updateContent(textarea.value);
          updatePreview(textarea.value);
        }
      });
      
      // 添加到容器
      editorContainer.appendChild(textarea);
      
      // 模拟一个编辑器实例，提供与 CodeMirror 兼容的接口
      editorInstance = {
        state: {
          doc: {
            toString: () => textarea.value
          },
          selection: {
            main: {
              from: () => textarea.selectionStart,
              to: () => textarea.selectionEnd
            }
          }
        },
        dispatch: (tr) => {
          if (tr.changes) {
            const content = textarea.value;
            const from = tr.changes.from;
            const to = tr.changes.to;
            const insert = tr.changes.insert;
            
            textarea.value = content.substring(0, from) + insert + content.substring(to);
            
            if (tr.selection) {
              textarea.selectionStart = textarea.selectionEnd = tr.selection.anchor;
            }
            
            // 更新内容
            documentStore.updateContent(textarea.value);
            updatePreview(textarea.value);
          }
          
          return true;
        },
        focus: () => textarea.focus(),
        destroy: () => {
          // 移除事件监听器
          textarea.removeEventListener('input', () => {});
          textarea.removeEventListener('keydown', () => {});
          
          // 从 DOM 中移除
          if (editorContainer.contains(textarea)) {
            editorContainer.removeChild(textarea);
          }
        }
      };
      
      console.log('Textarea editor initialized successfully');
      
      // 设置编辑器就绪状态
      setTimeout(() => {
        editorReady = true;
        console.log('Editor ready state set to true');
      }, 100);
      
      // Initial preview render
      updatePreview($documentStore.currentContent || defaultContent);
      
      // Sync scrolling (basic implementation)
      if (editorContainer && previewContainer) {
        editorContainer.addEventListener('scroll', handleEditorScroll);
        previewContainer.addEventListener('scroll', handlePreviewScroll);
      }
      
      return true;
    } catch (error) {
      console.error('Failed to initialize editor:', error);
      
      if (retryCount < maxRetries) {
        console.log(`Critical error, retrying editor initialization in 500ms...`);
        setTimeout(() => initEditor(retryCount + 1, maxRetries), 500);
        return false;
      }
      
      // 显示友好的错误消息在编辑器容器中
      if (editorContainer) {
        editorContainer.innerHTML = `
          <div class="editor-error p-4">
            <h3 class="text-red-500 font-bold">编辑器初始化失败</h3>
            <p class="mb-2">请尝试刷新页面或联系管理员。</p>
            <pre class="bg-red-100 dark:bg-red-900 p-2 rounded overflow-auto text-sm">${error.message}</pre>
            <button class="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600" 
                    onclick="location.reload()">刷新页面</button>
          </div>
        `;
      }
      
      // 标记为未就绪
      editorReady = false;
      return false;
    }
  }
  
  // Initialize the web worker for markdown processing
  function initWorker() {
    // Check if Worker API is available
    if (typeof Worker !== 'undefined') {
      try {
        // In a real implementation, we would create a dedicated worker:
        // workerInstance = new Worker('/workers/markdown-worker.js');
        
        // For now, we'll emulate worker behavior with a timeout
        // In a real implementation, we would post messages to and from the worker
      } catch (error) {
        console.error('Failed to initialize worker:', error);
      }
    }
  }
  
  // Update preview with debounce
  const updatePreview = (content: string) => {
    // 添加调试日志
    console.log('更新预览，内容长度:', content.length);
    
    // Emulate a worker processing delay (200ms)
    setTimeout(() => {
      try {
        previewContent = renderMarkdown(content);
        console.log('预览更新完成，HTML长度:', previewContent.length);
        
        // 检查是否包含表格
        if (previewContent.includes('<table')) {
          console.log('预览包含表格');
        }
      } catch (error) {
        console.error('预览渲染错误:', error);
        previewContent = `<div class="error">预览渲染错误: ${error}</div>`;
      }
    }, 200);
  };
  
  // Scroll synchronization
  function handleEditorScroll() {
    if (isScrolling) return;
    
    isScrolling = true;
    
    const editorScrollPercentage = editorContainer.scrollTop / 
      (editorContainer.scrollHeight - editorContainer.clientHeight || 1);
    
    previewContainer.scrollTop = editorScrollPercentage * 
      (previewContainer.scrollHeight - previewContainer.clientHeight || 1);
    
    setTimeout(() => {
      isScrolling = false;
    }, 50);
  }
  
  function handlePreviewScroll() {
    if (isScrolling) return;
    
    isScrolling = true;
    
    const previewScrollPercentage = previewContainer.scrollTop / 
      (previewContainer.scrollHeight - previewContainer.clientHeight || 1);
    
    editorContainer.scrollTop = previewScrollPercentage * 
      (editorContainer.scrollHeight - editorContainer.clientHeight || 1);
    
    setTimeout(() => {
      isScrolling = false;
    }, 50);
  }
  
  // Implement export functionality
  function exportDocument() {
    documentStore.exportDocument().then(content => {
      const blob = new Blob([content], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'document.md';
      a.click();
      URL.revokeObjectURL(url);
    });
  }
  
  // Subscribe to document changes
  const unsubscribe = documentStore.subscribe(state => {
    if (editorInstance && state.currentContent !== editorInstance.state.doc.toString()) {
      // If external content change, update editor
      editorInstance.dispatch({
        changes: { from: 0, to: editorInstance.state.doc.length, insert: state.currentContent }
      });
    }
  });
  
  // Setup export listener
  function setupExportListener() {
    window.addEventListener('export-document', exportDocument);
    return () => window.removeEventListener('export-document', exportDocument);
  }
  
  // 处理 MarkdownToolbar 的工具栏动作
  function handleToolbarAction(event) {
    const { action, placeholder } = event.detail;
    console.log(`Toolbar action received: ${action}, editor ready: ${editorReady}`);
    
    // 双重检查编辑器是否真正就绪
    if (!editorReady) {
      console.warn('编辑器尚未就绪，无法执行操作');
      showErrorNotification('请等待编辑器完全加载');
      return;
    }
    
    try {
      // 尝试直接获取 textarea 元素
      const textarea = editorContainer.querySelector('textarea');
      if (textarea) {
        // 获取当前选择
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        
        console.log(`直接处理 textarea 插入，位置 ${start}-${end}: "${placeholder}"`);
        
        // 插入文本
        textarea.value = textarea.value.substring(0, start) + placeholder + textarea.value.substring(end);
        
        // 更新光标位置
        textarea.selectionStart = textarea.selectionEnd = start + placeholder.length;
        
        // 更新内容和预览
        documentStore.updateContent(textarea.value);
        updatePreview(textarea.value);
        
        // 聚焦
        textarea.focus();
        console.log('文本插入成功');
        return;
      }
      
      // 如果没有找到 textarea 元素，尝试使用 editorInstance
      if (editorInstance) {
        try {
          // 获取当前编辑器状态和选择
          const { state } = editorInstance;
          const selection = state.selection.main;
          
          // 根据选择情况插入文本
          let from = selection.from;
          let to = selection.to;
          
          console.log(`使用 editorInstance 插入文本，位置 ${from}-${to}: "${placeholder}"`);
          
          // 创建事务
          editorInstance.dispatch({
            changes: {
              from,
              to,
              insert: placeholder
            },
            // 更新选择（可选）
            selection: { anchor: from + placeholder.length }
          });
          
          // 插入后聚焦编辑器
          editorInstance.focus();
          console.log('文本插入成功');
        } catch (editorError) {
          console.error('使用 editorInstance 插入文本失败:', editorError);
          throw editorError;
        }
      } else {
        throw new Error('找不到可用的编辑器');
      }
    } catch (error) {
      console.error('工具栏操作处理失败:', error);
      showErrorNotification(`无法执行操作: ${error.message}`);
    }
  }
  
  // 显示错误通知
  function showErrorNotification(message) {
    // 查找或创建通知容器
    let container = document.querySelector('.notification-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'notification-container fixed top-4 right-4 z-50 flex flex-col gap-2';
      document.body.appendChild(container);
    }
    
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-4 py-2 rounded-lg shadow-md text-sm max-w-xs animate-fade-in';
    notification.innerHTML = message;
    container.appendChild(notification);
    
    // 3秒后自动移除
    setTimeout(() => {
      notification.classList.add('animate-fade-out');
      setTimeout(() => notification.remove(), 300);
    }, 5000);
  }
  
  // 打开设置对话框
  function openSettings() {
    showSettingsDialog = true;
  }
  
  // 应用设置到编辑器
  $: if (editorInstance && $settingsStore) {
    // 应用字体大小
    editorContainer.style.fontSize = `${$settingsStore.fontSize}px`;
    
    // 应用行高
    editorContainer.style.lineHeight = $settingsStore.lineHeight.toString();
    
    // 应用其他设置...
    if (!$settingsStore.syncScroll) {
      editorContainer.removeEventListener('scroll', handleEditorScroll);
      previewContainer.removeEventListener('scroll', handlePreviewScroll);
    } else {
      editorContainer.addEventListener('scroll', handleEditorScroll);
      previewContainer.addEventListener('scroll', handlePreviewScroll);
    }
    
    // 更新编辑器配置
    // 注意：某些设置可能需要重新创建编辑器才能生效
  }
  
  // 自动保存定时器
  let autoSaveTimer;
  
  // 设置自动保存定时器
  $: if ($settingsStore) {
    // 清除现有定时器
    if (autoSaveTimer) {
      clearInterval(autoSaveTimer);
      autoSaveTimer = null;
    }
    
    // 如果启用了自动保存，设置新定时器
    if ($settingsStore.autoSave) {
      autoSaveTimer = setInterval(() => {
        // 使用 updateContent 代替 saveDocument
        // 这会触发内部的 saveDocument 方法
        if (editorInstance) {
          const content = editorInstance.state.doc.toString();
          documentStore.updateContent(content);
          console.log('Auto-saving document...');
        }
      }, $settingsStore.autoSaveInterval * 1000);
    }
  }
  
  onMount(async () => {
    console.log('Editor component mounted');
    
    // 明确设置初始状态
    editorReady = false;
    
    // 声明自动保存计时器变量，确保它在清理函数中可访问
    let autoSaveTimerInstance;
    
    try {
      // 加载文档
      console.log('Loading document...');
      try {
        await documentStore.loadDocument();
        console.log('Document loaded successfully');
      } catch (loadError) {
        console.error('Error loading document:', loadError);
        // 即使文档加载失败，仍继续使用默认内容
        documentStore.updateContent(defaultContent);
      }
      
      // 确保DOM元素已加载，再初始化编辑器
      console.log('Waiting for DOM elements to be ready...');
      
      // 检查DOM元素是否可用的函数
      const checkDomReady = () => {
        if (document.readyState === 'complete' && editorContainer) {
          console.log('DOM is ready and editor container found');
          return true;
        }
        return false;
      };
      
      // 等待DOM就绪
      if (checkDomReady()) {
        console.log('DOM already ready, initializing editor immediately');
        await initEditor();
      } else {
        console.log('Waiting for DOM to be ready...');
        let attempts = 0;
        const maxAttempts = 10;
        
        const waitAndInit = () => {
          attempts++;
          if (checkDomReady()) {
            console.log('DOM is now ready, initializing editor...');
            initEditor();
          } else if (attempts < maxAttempts) {
            console.log(`DOM not ready yet, attempt ${attempts}/${maxAttempts}`);
            setTimeout(waitAndInit, 100 * attempts); // 逐渐增加等待时间
          } else {
            console.error('Timed out waiting for DOM to be ready');
            showErrorNotification('编辑器加载超时，请刷新页面重试');
          }
        };
        
        setTimeout(waitAndInit, 100);
      }
      
      // 设置导出监听器
      const removeExportListener = setupExportListener();
      
      // 设置自动保存计时器 (使用已有的 autoSaveTimer 变量而不是创建新的)
      if (autoSaveTimer) {
        clearInterval(autoSaveTimer);
      }
      
      autoSaveTimer = setInterval(() => {
        if (editorInstance) {
          try {
            // 从编辑器获取当前内容
            const content = editorInstance.state.doc.toString();
            console.log('Auto-saving document...');
            
            // 使用 updateContent 方法更新文档内容，这会触发内部的 saveDocument 
            documentStore.updateContent(content);
          } catch (e) {
            console.error('Error during auto-save:', e);
          }
        }
      }, 30000); // 每30秒保存一次
      
      // 组件销毁时清理资源
      return () => {
        console.log('Editor component unmounting, cleaning up resources...');
        
        // 清除自动保存计时器
        if (autoSaveTimer) {
          clearInterval(autoSaveTimer);
          console.log('Auto-save timer cleared');
        }
        
        // 清除导出监听器
        if (typeof removeExportListener === 'function') {
          removeExportListener();
        }
        
        // 如果编辑器实例存在，则销毁
        if (editorInstance) {
          try {
            editorInstance.destroy();
            editorInstance = undefined;
            console.log('Editor instance destroyed');
          } catch (e) {
            console.error('Error destroying editor instance:', e);
          }
        }
      };
    } catch (error) {
      console.error('Critical error during editor mounting:', error);
      showErrorNotification('编辑器初始化失败，请刷新页面');
    }
  });
  
  onDestroy(() => {
    // 清除自动保存定时器
    if (autoSaveTimer) {
      clearInterval(autoSaveTimer);
    }
    
    // Clean up
    unsubscribe();
    
    if (editorInstance) {
      editorInstance.destroy();
    }
    
    if (workerInstance) {
      workerInstance.terminate();
    }
    
    editorContainer?.removeEventListener('scroll', handleEditorScroll);
    previewContainer?.removeEventListener('scroll', handlePreviewScroll);
  });
</script>

<div class="w-full flex flex-col">
  <div class="flex justify-between items-center mb-2">
    <MarkdownToolbar on:action={handleToolbarAction} editorReady={editorReady} />
    
    <button 
      class="settings-button"
      title="打开设置"
      on:click={openSettings}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="3"></circle>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
      </svg>
    </button>
  </div>
  
  <div class="mt-4 flex flex-col md:flex-row h-[calc(100vh-200px)] overflow-hidden rounded-lg shadow-md">
    <!-- Editor panel -->
    <div 
      class="flex-1 bg-base-100 dark:bg-base-100-dark border border-base-300 dark:border-base-300-dark overflow-auto"
      bind:this={editorContainer}
    >
      <!-- CodeMirror will be mounted here -->
      {#if !editorReady}
        <div class="flex items-center justify-center h-full">
          <div class="text-center">
            <div class="spinner mb-2"></div>
            <p>编辑器加载中...</p>
          </div>
        </div>
      {/if}
    </div>
    
    <!-- Preview panel -->
    <div 
      class="flex-1 bg-base-100 dark:bg-base-100-dark border-t md:border-t-0 md:border-l border-base-300 dark:border-base-300-dark overflow-auto will-change-transform"
      bind:this={previewContainer}
    >
      <div 
        class="prose dark:prose-invert max-w-none p-6"
        class:hide-code-bg={!$settingsStore.showCodeBackground}
        class:hide-math-bg={!$settingsStore.showMathBackground}
      >
        {@html previewContent}
      </div>
    </div>
  </div>
</div>

<SettingsDialog bind:isOpen={showSettingsDialog} />

<style>
  .settings-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: transparent;
    color: var(--color-text-muted-light);
    border: 1px solid var(--color-border-light);
    cursor: pointer;
    transition: var(--transition-normal);
  }
  
  :global(.dark) .settings-button {
    color: var(--color-text-muted-dark);
    border-color: var(--color-border-dark);
  }
  
  .settings-button:hover {
    background-color: rgba(0, 0, 0, 0.05);
    color: var(--color-primary);
  }
  
  :global(.dark) .settings-button:hover {
    background-color: rgba(255, 255, 255, 0.05);
    color: var(--color-primary-light);
  }
  
  /* 加载动画 */
  .spinner {
    width: 30px;
    height: 30px;
    border: 3px solid rgba(79, 70, 229, 0.2);
    border-radius: 50%;
    border-top-color: var(--color-primary);
    animation: spin 1s ease-in-out infinite;
    margin: 0 auto;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  /* 代码块样式 */
  :global(.prose pre) {
    padding: 1rem !important;
    border-radius: var(--radius) !important;
    overflow-x: auto !important;
    margin: 1em 0 !important;
    box-sizing: border-box !important;
    border: 1px solid var(--color-border-light) !important;
    background-color: var(--color-bg-code-light) !important;
  }
  
  :global(.dark .prose pre) {
    border-color: var(--color-border-dark) !important;
    background-color: var(--color-bg-code-dark) !important;
  }
  
  /* 代码块背景控制 */
  :global(.hide-code-bg .prose pre) {
    background-color: transparent !important;
  }
  
  /* 行内代码样式 */
  :global(.prose code:not(pre code)) {
    background-color: var(--color-bg-code-light);
    padding: 0.2em 0.4em;
    border-radius: var(--radius-sm);
    font-size: 0.9em;
  }
  
  :global(.dark .prose code:not(pre code)) {
    background-color: var(--color-bg-code-dark);
  }
  
  /* 公式块样式 */
  :global(.katex-display) {
    padding: 1rem !important;
    margin: 1.5rem 0 !important;
    border-radius: var(--radius) !important;
    overflow-x: auto !important;
    box-sizing: border-box !important;
    border: 1px solid var(--color-border-light) !important;
    background-color: var(--color-bg-code-light) !important;
  }
  
  :global(.dark .katex-display) {
    border-color: var(--color-border-dark) !important;
    background-color: var(--color-bg-code-dark) !important;
  }
  
  /* 公式块背景控制 */
  :global(.hide-math-bg .katex-display) {
    background-color: transparent !important;
    border-color: transparent !important;
  }
  
  /* 表格样式 */
  :global(.prose table), :global(.md-table) {
    width: 100% !important;
    border-collapse: collapse !important;
    margin: 1.5rem 0 !important;
    overflow-x: auto !important;
    display: block !important;
    border: 1px solid var(--color-border-light) !important;
  }
  
  :global(.prose thead), :global(.md-table thead) {
    background-color: var(--color-bg-code-light) !important;
    border-bottom: 2px solid var(--color-border-light) !important;
  }
  
  :global(.dark .prose thead), :global(.dark .md-table thead) {
    background-color: var(--color-bg-code-dark) !important;
    border-bottom-color: var(--color-border-dark) !important;
  }
  
  :global(.prose th), :global(.md-table th) {
    font-weight: 600 !important;
    text-align: left !important;
    background-color: #f5f5f5 !important;
  }
  
  :global(.dark .prose th), :global(.dark .md-table th) {
    background-color: #2a2a2a !important;
  }
  
  :global(.prose th, .prose td), :global(.md-table th, .md-table td) {
    padding: 0.75rem 1rem !important;
    border: 1px solid var(--color-border-light) !important;
    min-width: 100px !important;
  }
  
  :global(.dark .prose th, .dark .prose td), :global(.dark .md-table th, .dark .md-table td) {
    border-color: var(--color-border-dark) !important;
  }
  
  :global(.prose tbody tr:nth-child(even)), :global(.md-table tbody tr:nth-child(even)) {
    background-color: rgba(0, 0, 0, 0.03) !important;
  }
  
  :global(.dark .prose tbody tr:nth-child(even)), :global(.dark .md-table tbody tr:nth-child(even)) {
    background-color: rgba(255, 255, 255, 0.03) !important;
  }
  
  /* 修复表格显示 */
  :global(.prose table), :global(.md-table) {
    overflow-x: auto !important;
    display: block !important;
    max-width: 100% !important;
  }
  
  @media (min-width: 768px) {
    :global(.prose table), :global(.md-table) {
      display: table !important;
      width: 100% !important;
    }
  }
</style> 