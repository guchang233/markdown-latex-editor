<script>
  import { onMount } from 'svelte';
  import { documentStore } from '../stores/document';
  import { renderMarkdown } from '../utils/markdown';
  import MarkdownToolbar from './MarkdownToolbar.svelte';
  import SettingsDialog from './SettingsDialog.svelte';
  import ExportDialogFixed from './ExportDialogFixed.svelte';
  
  // DOM elements
  let editorContainer;
  let previewContainer;
  
  // State
  let previewContent = '';
  let showSettingsDialog = false;
  let editorReady = false;
  let showExportDialog = false;
  
  // Default content
  const defaultContent = "# 欢迎使用 MarkTeX 编辑器\n\n这是一个简化版编辑器。";
  
  // Update preview
  function updatePreview(content) {
    previewContent = renderMarkdown(content);
  }
  
  // Open settings dialog
  function openSettings() {
    showSettingsDialog = true;
  }
  
  // Open export dialog
  function openExportDialog() {
    console.log('Opening export dialog (before):', showExportDialog);
    showExportDialog = true;
    console.log('Opening export dialog (after):', showExportDialog);
  }
  
  // Handle export
  function handleExport(event) {
    const { format, includeStyles, filename, includeToc, paperSize, codeTheme } = event.detail;
    console.log('处理导出:', format, filename);
    
    if (format === 'html') {
      // Export as HTML
      const html = renderMarkdown($documentStore.currentContent || defaultContent);
      
      // Use template literals for the style tag to avoid unterminated string issues
      const styleTag = includeStyles 
        ? `<style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              line-height: 1.6;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
              color: #333;
            }
            h1, h2, h3 { margin-top: 1.5em; }
            pre {
              background: #f5f5f5;
              padding: 10px;
              border-radius: 4px;
              overflow-x: auto;
            }
          </style>` 
        : '';
      
      const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${filename}</title>
  ${styleTag}
</head>
<body>
  ${includeToc ? '<div class="toc"><h2>目录</h2>...</div>' : ''}
  ${html}
</body>
</html>`;
      
      // Download HTML
      const blob = new Blob([fullHtml], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.html`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (format === 'pdf') {
      // Export as PDF using print dialog
      const printWindow = window.open('', '_blank');
      const html = renderMarkdown($documentStore.currentContent || defaultContent);
      
      // 注意：这里我们不使用任何变量，而是直接将所有内容硬编码，避免CSS预处理器错误
      let pdfStyle = '';
      
      // 根据用户选择的纸张大小设置CSS
      if (paperSize === 'letter') {
        pdfStyle = `
          <style>
            /* Letter paper size */
            body { 
              font-family: system-ui, -apple-system, sans-serif; 
              line-height: 1.6; 
              color: #333;
              margin: 2cm;
            }
            h1, h2, h3 { margin-top: 1.5em; }
            pre { 
              background: #f5f5f5; 
              padding: 10px; 
              border-radius: 4px; 
              overflow-x: auto; 
            }
          </style>
        `;
      } else if (paperSize === 'legal') {
        pdfStyle = `
          <style>
            /* Legal paper size */
            body { 
              font-family: system-ui, -apple-system, sans-serif; 
              line-height: 1.6; 
              color: #333;
              margin: 2cm;
            }
            h1, h2, h3 { margin-top: 1.5em; }
            pre { 
              background: #f5f5f5; 
              padding: 10px; 
              border-radius: 4px; 
              overflow-x: auto; 
            }
          </style>
        `;
      } else {
        // 默认使用A4
        pdfStyle = `
          <style>
            /* A4 paper size */
            body { 
              font-family: system-ui, -apple-system, sans-serif; 
              line-height: 1.6; 
              color: #333;
              margin: 2cm;
            }
            h1, h2, h3 { margin-top: 1.5em; }
            pre { 
              background: #f5f5f5; 
              padding: 10px; 
              border-radius: 4px; 
              overflow-x: auto; 
            }
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
      // Export as Markdown
      const blob = new Blob([$documentStore.currentContent || defaultContent], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.md`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }
  
  // Handle toolbar actions
  function handleToolbarAction(event) {
    const { action, placeholder } = event.detail;
    console.log(`工具栏动作: ${action}`);
  }
  
  // Handle textarea input
  function handleTextareaChange(event) {
    const content = event.target.value;
    documentStore.updateContent(content);
    updatePreview(content);
  }
  
  onMount(() => {
    console.log('编辑器组件已挂载');
    
    // 强制确保对话框在初始化时是关闭的
    showExportDialog = false;
    
    // 防止对话框意外打开
    setTimeout(() => {
      if (showExportDialog) {
        console.log('强制关闭导出对话框');
        showExportDialog = false;
      }
    }, 100);
    
    // Handle export document event
    const handleExportDocumentEvent = (event) => {
      console.log('收到导出文档事件');
      // 不要自动打开对话框，除非用户明确请求
    };
    
    // Add event listener
    window.addEventListener('export-document', handleExportDocumentEvent);
    
    // Set editor ready
    editorReady = true;
    
    // Initialize content
    if (!$documentStore.currentContent) {
      documentStore.updateContent(defaultContent);
    }
    
    // Initial preview
    updatePreview($documentStore.currentContent || defaultContent);
    
    return () => {
      // Remove event listener
      window.removeEventListener('export-document', handleExportDocumentEvent);
    };
  });
</script>

<div class="w-full flex flex-col">
  <div class="flex justify-between items-center mb-2">
    <MarkdownToolbar on:action={handleToolbarAction} editorReady={editorReady} />
    
    <div class="flex items-center gap-2">
      <!-- Export button -->
      <button 
        class="export-btn"
        title="导出文档"
        on:click={openExportDialog}
      >
        导出
      </button>
      
      <!-- Settings button -->
      <button 
        class="settings-btn"
        title="打开设置"
        on:click={openSettings}
      >
        设置
      </button>
    </div>
  </div>
  
  <div class="mt-4 flex flex-col md:flex-row h-[calc(100vh-200px)] overflow-hidden rounded-lg shadow-md">
    <!-- Editor panel -->
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
    
    <!-- Preview panel -->
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

<!-- Dialogs -->
<SettingsDialog bind:isOpen={showSettingsDialog} />
<ExportDialogFixed bind:isOpen={showExportDialog} on:export={handleExport} />

<style>
  .export-btn, 
  .settings-btn {
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
  
  :global(.dark) .export-btn, 
  :global(.dark) .settings-btn {
    border-color: #374151;
  }
  
  .export-btn:hover, 
  .settings-btn:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
  
  :global(.dark) .export-btn:hover, 
  :global(.dark) .settings-btn:hover {
    background-color: rgba(255, 255, 255, 0.05);
  }
</style> 