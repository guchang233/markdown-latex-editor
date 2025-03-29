<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { themeStore } from '../stores/theme';
  import { documentStore } from '../stores/document';
  import { settingsStore } from '../stores/settings';
  import MarkdownToolbar from './MarkdownToolbar.svelte';
  import { renderMarkdown } from '../utils/markdown';
  import SettingsDialog from './SettingsDialog.svelte';
  import ExportDialogFixed from './ExportDialogFixed.svelte';
  
  // 编辑器和预览元素
  let editorContainer;
  let previewContainer;
  
  // 状态变量
  let previewContent = '';
  let showSettingsDialog = false;
  let editorReady = false;
  let showExportDialog = false;
  
  // 默认内容
  const defaultContent = "# 欢迎使用 MarkTeX 编辑器\n\n这是一个简化版编辑器。";
  
  // 简单的预览更新函数
  function updatePreview(content) {
    previewContent = renderMarkdown(content);
  }
  
  // 打开设置对话框
  function openSettings() {
    showSettingsDialog = true;
  }
  
  // 打开导出对话框
  function openExportDialog() {
    console.log('Opening export dialog');
    showExportDialog = true;
  }
  
  // 处理导出事件
  function handleExport(event) {
    const { format, includeStyles, filename, includeToc, pageSize, codeTheme } = event.detail;
    console.log('处理导出:', format, filename);
    
    // 处理不同的导出格式
    if (format === 'html') {
      // 导出为HTML
      const html = renderMarkdown($documentStore.currentContent || defaultContent);
      const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${filename}</title>
  ${includeStyles ? '<style>body{font-family:system-ui,-apple-system,sans-serif;line-height:1.6;max-width:800px;margin:0 auto;padding:20px;color:#333}h1,h2,h3{margin-top:1.5em}pre{background:#f5f5f5;padding:10px;border-radius:4px;overflow-x:auto}</style>' : ''}
</head>
<body>
  ${includeToc ? '<div class="toc"><h2>目录</h2>...</div>' : ''}
  ${html}
</body>
</html>`;
      
      // 创建临时链接并下载
      const blob = new Blob([fullHtml], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.html`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (format === 'pdf') {
      // 打开打印窗口让用户导出为PDF
      const printWindow = window.open('', '_blank');
      const html = renderMarkdown($documentStore.currentContent || defaultContent);
      
      // 不使用变量，避免CSS预处理器错误
      let pdfStyle = '';
      
      // 根据用户选择的纸张大小设置样式
      if (pageSize === 'letter') {
        pdfStyle = `
          <style>
            /* 使用letter纸张大小 */
            body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #333; margin: 2cm; }
            h1, h2, h3 { margin-top: 1.5em; }
            pre { background: #f5f5f5; padding: 10px; border-radius: 4px; overflow-x: auto; }
          </style>
        `;
      } else if (pageSize === 'legal') {
        pdfStyle = `
          <style>
            /* 使用legal纸张大小 */
            body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #333; margin: 2cm; }
            h1, h2, h3 { margin-top: 1.5em; }
            pre { background: #f5f5f5; padding: 10px; border-radius: 4px; overflow-x: auto; }
          </style>
        `;
      } else {
        // 默认使用A4
        pdfStyle = `
          <style>
            /* 使用A4纸张大小 */
            body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #333; margin: 2cm; }
            h1, h2, h3 { margin-top: 1.5em; }
            pre { background: #f5f5f5; padding: 10px; border-radius: 4px; overflow-x: auto; }
          </style>
        `;
      }
      
      printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${filename}</title>
  ${pdfStyle}
</head>
<body>
  ${includeToc ? '<div class="toc"><h2>目录</h2>...</div>' : ''}
  ${html}
</body>
</html>`);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    } else {
      // 导出为Markdown
      const blob = new Blob([$documentStore.currentContent || defaultContent], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.md`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }
  
  // 处理工具栏动作
  function handleToolbarAction(event) {
    const { action, placeholder } = event.detail;
    console.log(`工具栏动作: ${action}`);
  }
  
  // 处理文本区域变化
  function handleTextareaChange(event) {
    const content = event.target.value;
    documentStore.updateContent(content);
    updatePreview(content);
  }
  
  onMount(() => {
    console.log('编辑器组件已挂载');
    console.log('导出对话框初始状态:', showExportDialog);
    
    // 明确设置对话框为关闭状态
    showExportDialog = false;
    
    // 创建一个导出事件处理函数
    const handleExportDocumentEvent = (event) => {
      console.log('收到导出文档事件');
      // 不要自动打开导出对话框
      // openExportDialog();
    };
    
    // 添加事件监听器以监听来自Header的导出事件
    window.addEventListener('export-document', handleExportDocumentEvent);
    
    editorReady = true;
    
    // 初始化内容
    if (!$documentStore.currentContent) {
      documentStore.updateContent(defaultContent);
    }
    
    // 初始预览渲染
    updatePreview($documentStore.currentContent || defaultContent);
    
    return () => {
      console.log('编辑器组件卸载');
      // 移除事件监听器
      window.removeEventListener('export-document', handleExportDocumentEvent);
    };
  });
</script>

<div class="w-full flex flex-col">
  <div class="flex justify-between items-center mb-2">
    <MarkdownToolbar on:action={handleToolbarAction} {editorReady} />
    
    <div class="flex items-center gap-2">
      <!-- 导出按钮 -->
      <button 
        class="export-button"
        title="导出文档"
        on:click={openExportDialog}
      >
        导出
      </button>
      
      <!-- 设置按钮 -->
      <button 
        class="settings-button"
        title="打开设置"
        on:click={openSettings}
      >
        设置
      </button>
    </div>
  </div>
  
  <div class="mt-4 flex flex-col md:flex-row h-[calc(100vh-200px)] overflow-hidden rounded-lg shadow-md">
    <!-- 编辑器面板 -->
    <div 
      class="flex-1 bg-base-100 dark:bg-base-100-dark border border-base-300 dark:border-base-300-dark overflow-auto"
      bind:this={editorContainer}
    >
      <textarea
        class="w-full h-full p-4 border-none outline-none resize-none"
        value={$documentStore.currentContent || defaultContent}
        on:input={handleTextareaChange}
      ></textarea>
    </div>
    
    <!-- 预览面板 -->
    <div 
      class="flex-1 bg-base-100 dark:bg-base-100-dark border-t md:border-t-0 md:border-l border-base-300 dark:border-base-300-dark overflow-auto"
      bind:this={previewContainer}
    >
      <div class="prose dark:prose-invert max-w-none p-6">
        {@html previewContent}
      </div>
    </div>
  </div>
</div>

<!-- 对话框组件 -->
<SettingsDialog bind:isOpen={showSettingsDialog} />
<ExportDialogFixed bind:isOpen={showExportDialog} on:export={handleExport} />

<style>
  .settings-button,
  .export-button {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px 12px;
    border-radius: 4px;
    background-color: transparent;
    border: 1px solid #e5e7eb;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  :global(.dark) .settings-button,
  :global(.dark) .export-button {
    border-color: #374151;
  }
  
  .settings-button:hover,
  .export-button:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
  
  :global(.dark) .settings-button:hover,
  :global(.dark) .export-button:hover {
    background-color: rgba(255, 255, 255, 0.05);
  }
</style> 