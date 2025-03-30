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
    
    // 确保所有内容都使用我们的渲染器处理，正确转换公式和其他Markdown语法
    const content = $documentStore.currentContent || defaultContent;
    const html = renderMarkdown(content);
    
    if (format === 'html') {
      // Export as HTML
      
      // Add KaTeX CSS for formula rendering
      const katexCss = `<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.4/dist/katex.min.css">`;
      
      // Create script tags as separate variables
      const katexScript = `<script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.4/dist/katex.min.js"><\/script>`;
      const autoRenderScript = `<script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.4/dist/contrib/auto-render.min.js" onload="renderMathInElement(document.body, {delimiters: [{left: '\\\\$\\\\$', right: '\\\\$\\\\$', display: true}, {left: '\\\\$', right: '\\\\$', display: false}]});"><\/script>`;
      
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
            /* 表格样式 */
            .table-container {
              max-width: 100%;
              overflow-x: auto;
              margin: 1rem 0;
              border-radius: 4px;
            }
            .md-table {
              border-collapse: collapse;
              width: 100%;
              font-size: 0.9em;
              margin-bottom: 1rem;
            }
            .md-table th {
              background-color: #f3f4f6;
              padding: 8px;
              text-align: left;
              border-bottom: 2px solid #ddd;
            }
            .md-table td {
              padding: 8px;
              border-bottom: 1px solid #ddd;
            }
            .md-table tr:nth-child(even) {
              background-color: #f9fafb;
            }
            /* 公式样式 */
            .math-block {
              background-color: #f8fafc;
              padding: 1rem;
              border-radius: 6px;
              margin: 1.5rem 0;
              overflow-x: auto;
            }
            .math-inline {
              background-color: #f1f5f9;
              border-radius: 4px;
              padding: 0.1em 0.2em;
            }
            .katex-display {
              margin: 1.5rem 0;
              overflow-x: auto;
              overflow-y: hidden;
            }
            .katex {
              font-size: 1.1em;
            }
          </style>` 
        : '';
      
      const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${filename}</title>
  ${katexCss}
  ${styleTag}
  ${katexScript}
  ${autoRenderScript}
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
      
      // 添加KaTeX CSS以确保公式正确渲染
      const katexCSS = `<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.4/dist/katex.min.css">`;
      
      // Create script tags as separate variables
      const katexScript = `<script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.4/dist/katex.min.js"><\/script>`;
      const autoRenderScript = `<script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.4/dist/contrib/auto-render.min.js" onload="renderMathInElement(document.body, {delimiters: [{left: '\\\\$\\\\$', right: '\\\\$\\\\$', display: true}, {left: '\\\\$', right: '\\\\$', display: false}]});"><\/script>`;
      
      // 注意：这里我们不使用任何变量，而是直接将所有内容硬编码，避免CSS预处理器错误
      let pdfStyle = '';
      
      // 根据用户选择的纸张大小设置CSS
      if (paperSize === 'letter') {
        pdfStyle = `
          <style>
            /* Letter paper size */
            @page { size: letter; }
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
            /* 表格样式 */
            .table-container {
              max-width: 100%;
              overflow-x: auto;
              margin: 1rem 0;
              page-break-inside: avoid;
            }
            .md-table {
              border-collapse: collapse;
              width: 100%;
              font-size: 0.9em;
              margin-bottom: 1rem;
            }
            .md-table th {
              background-color: #f3f4f6;
              padding: 8px;
              text-align: left;
              border-bottom: 2px solid #ddd;
            }
            .md-table td {
              padding: 8px;
              border-bottom: 1px solid #ddd;
            }
            .md-table tr:nth-child(even) {
              background-color: #f9fafb;
            }
            /* 公式样式 */
            .math-block {
              background-color: #f8fafc;
              padding: 1rem;
              border-radius: 6px;
              margin: 1.5rem 0;
              overflow-x: auto;
            }
            .math-inline {
              background-color: #f1f5f9;
              border-radius: 4px;
              padding: 0.1em 0.2em;
            }
            .katex-display {
              margin: 1.5rem 0;
              overflow-x: auto;
              overflow-y: hidden;
            }
            .katex {
              font-size: 1.1em;
            }
          </style>
        `;
      } else if (paperSize === 'legal') {
        pdfStyle = `
          <style>
            /* Legal paper size */
            @page { size: legal; }
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
            /* 表格样式 */
            .table-container {
              max-width: 100%;
              overflow-x: auto;
              margin: 1rem 0;
              page-break-inside: avoid;
            }
            .md-table {
              border-collapse: collapse;
              width: 100%;
              font-size: 0.9em;
              margin-bottom: 1rem;
            }
            .md-table th {
              background-color: #f3f4f6;
              padding: 8px;
              text-align: left;
              border-bottom: 2px solid #ddd;
            }
            .md-table td {
              padding: 8px;
              border-bottom: 1px solid #ddd;
            }
            .md-table tr:nth-child(even) {
              background-color: #f9fafb;
            }
            /* 公式样式 */
            .math-block {
              background-color: #f8fafc;
              padding: 1rem;
              border-radius: 6px;
              margin: 1.5rem 0;
              overflow-x: auto;
            }
            .math-inline {
              background-color: #f1f5f9;
              border-radius: 4px;
              padding: 0.1em 0.2em;
            }
            .katex-display {
              margin: 1.5rem 0;
              overflow-x: auto;
              overflow-y: hidden;
            }
            .katex {
              font-size: 1.1em;
            }
          </style>
        `;
      } else {
        // 默认使用A4
        pdfStyle = `
          <style>
            /* A4 paper size */
            @page { size: A4; }
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
            /* 表格样式 */
            .table-container {
              max-width: 100%;
              overflow-x: auto;
              margin: 1rem 0;
              page-break-inside: avoid;
            }
            .md-table {
              border-collapse: collapse;
              width: 100%;
              font-size: 0.9em;
              margin-bottom: 1rem;
            }
            .md-table th {
              background-color: #f3f4f6;
              padding: 8px;
              text-align: left;
              border-bottom: 2px solid #ddd;
            }
            .md-table td {
              padding: 8px;
              border-bottom: 1px solid #ddd;
            }
            .md-table tr:nth-child(even) {
              background-color: #f9fafb;
            }
            /* 公式样式 */
            .math-block {
              background-color: #f8fafc;
              padding: 1rem;
              border-radius: 6px;
              margin: 1.5rem 0;
              overflow-x: auto;
            }
            .math-inline {
              background-color: #f1f5f9;
              border-radius: 4px;
              padding: 0.1em 0.2em;
            }
            .katex-display {
              margin: 1.5rem 0;
              overflow-x: auto;
              overflow-y: hidden;
            }
            .katex {
              font-size: 1.1em;
            }
          </style>
        `;
      }
      
      printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${filename}</title>
  ${katexCSS}
  ${pdfStyle}
  ${katexScript}
  ${autoRenderScript}
</head>
<body>
  ${includeToc ? '<div class="toc"><h2>目录</h2>...</div>' : ''}
  ${html}
</body>
</html>`);
      printWindow.document.close();
      
      // 确保KaTeX完全加载后再打印
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 1000);
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
    console.log(`工具栏动作: ${action}`, placeholder);
    
    // 确保编辑器已准备好
    if (!editorReady) {
      console.log('编辑器未就绪，无法执行操作');
      return;
    }
    
    // 获取文本区域
    const textarea = editorContainer.querySelector('textarea');
    if (!textarea) {
      console.error('无法找到编辑区域');
      return;
    }
    
    // 获取当前选择
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    const beforeText = textarea.value.substring(0, start);
    const afterText = textarea.value.substring(end);
    
    let newText = '';
    let newCursorPos = 0;
    
    // 根据不同的动作执行不同的插入操作
    switch (action) {
      case 'bold':
        newText = beforeText + '**' + (selectedText || '粗体文本') + '**' + afterText;
        newCursorPos = selectedText ? start + selectedText.length + 4 : start + 8;
        break;
      case 'italic':
        newText = beforeText + '*' + (selectedText || '斜体文本') + '*' + afterText;
        newCursorPos = selectedText ? start + selectedText.length + 2 : start + 6;
        break;
      case 'strikethrough':
        newText = beforeText + '~~' + (selectedText || '删除线文本') + '~~' + afterText;
        newCursorPos = selectedText ? start + selectedText.length + 4 : start + 8;
        break;
      case 'code':
        newText = beforeText + '`' + (selectedText || '代码') + '`' + afterText;
        newCursorPos = selectedText ? start + selectedText.length + 2 : start + 4;
        break;
      case 'link':
        newText = beforeText + '[' + (selectedText || '链接文本') + '](https://example.com)' + afterText;
        newCursorPos = selectedText ? start + selectedText.length + 3 : start + 11;
        break;
      case 'image':
        newText = beforeText + '![' + (selectedText || '图片描述') + '](https://example.com/image.jpg)' + afterText;
        newCursorPos = start + newText.length - afterText.length;
        break;
      case 'table':
        // 插入表格模板
        const tableTemplate = '\n| 标题1 | 标题2 | 标题3 |\n| ------- | ------- | ------- |\n| 单元格1 | 单元格2 | 单元格3 |\n| 单元格4 | 单元格5 | 单元格6 |\n';
        newText = beforeText + tableTemplate + afterText;
        newCursorPos = start + tableTemplate.length;
        break;
      case 'formula':
        newText = beforeText + '$' + (selectedText || 'E = mc^2') + '$' + afterText;
        newCursorPos = selectedText ? start + selectedText.length + 2 : start + 10;
        break;
      case 'bulletList':
        newText = beforeText + '\n- ' + (selectedText || '列表项目') + '\n- 另一个项目\n' + afterText;
        newCursorPos = start + newText.length - afterText.length;
        break;
      case 'numberedList':
        newText = beforeText + '\n1. ' + (selectedText || '第一项') + '\n2. 第二项\n' + afterText;
        newCursorPos = start + newText.length - afterText.length;
        break;
      case 'taskList':
        newText = beforeText + '\n- [ ] ' + (selectedText || '待办事项') + '\n- [x] 已完成事项\n' + afterText;
        newCursorPos = start + newText.length - afterText.length;
        break;
      case 'heading':
        newText = beforeText + '\n## ' + (selectedText || '标题') + '\n' + afterText;
        newCursorPos = start + newText.length - afterText.length - 1;
        break;
      default:
        // 如果没有匹配的动作，直接插入placeholder
        newText = beforeText + placeholder + afterText;
        newCursorPos = start + placeholder.length;
    }
    
    // 更新文本内容
    textarea.value = newText;
    textarea.focus();
    textarea.setSelectionRange(newCursorPos, newCursorPos);
    
    // 触发input事件，确保更新预览和store
    const inputEvent = new Event('input', { bubbles: true });
    textarea.dispatchEvent(inputEvent);
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
    
    // 监听滚动事件确保工具栏可见性
    const toolbar = document.getElementById('markdown-toolbar');
    const editorRoot = document.getElementById('editor-root-container');
    const mainContainer = document.getElementById('app-main-container');
    
    if (toolbar && mainContainer) {
      mainContainer.addEventListener('scroll', () => {
        const rect = toolbar.getBoundingClientRect();
        if (rect.top < 0) {
          toolbar.classList.add('toolbar-sticky');
        } else {
          toolbar.classList.remove('toolbar-sticky');
        }
      });
    }
    
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

<div class="editor-container" id="editor-root-container">
  <div class="toolbar-container" id="markdown-toolbar">
    <MarkdownToolbar on:action={handleToolbarAction} editorReady={editorReady} />
    
    <div class="buttons-container">
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
  
  <div class="panels-container">
    <!-- Editor panel -->
    <div 
      class="editor-panel"
      bind:this={editorContainer}
    >
      <textarea
        class="editor-textarea"
        value={$documentStore.currentContent || defaultContent}
        on:input={handleTextareaChange}
      ></textarea>
    </div>
    
    <!-- Preview panel -->
    <div 
      class="preview-panel"
      bind:this={previewContainer}
    >
      <div class="prose dark:prose-invert max-w-none preview-content">
        {@html previewContent}
      </div>
    </div>
  </div>
</div>

<!-- Dialogs -->
<SettingsDialog bind:isOpen={showSettingsDialog} />
<ExportDialogFixed bind:isOpen={showExportDialog} on:export={handleExport} />

<style>
  .editor-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    overflow: hidden;
    position: relative;
  }
  
  .toolbar-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 1rem;
    flex-shrink: 0;
    position: sticky;
    top: 0;
    z-index: 10;
    background-color: var(--color-base-100, #ffffff);
    border-bottom: 1px solid var(--color-base-300, #e5e7eb);
    box-shadow: var(--shadow-sm);
    transition: all 0.2s ease;
  }
  
  .toolbar-sticky {
    box-shadow: var(--shadow-md);
  }
  
  .panels-container {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    overflow: hidden;
    border-radius: 0.5rem;
    margin: 0 1rem 1rem 1rem;
    min-height: 0; /* 确保flex子元素可以收缩 */
  }
  
  @media (min-width: 768px) {
    .panels-container {
      flex-direction: row;
    }
  }
  
  .editor-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    background-color: var(--color-base-100, #ffffff);
    border: 1px solid var(--color-base-300, #e5e7eb);
    overflow: auto;
  }
  
  .preview-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    background-color: var(--color-base-100, #ffffff);
    border: 1px solid var(--color-base-300, #e5e7eb);
    overflow: auto;
  }
  
  .editor-textarea {
    width: 100%;
    height: 100%;
    padding: 1.25rem;
    border: none;
    outline: none;
    resize: none;
    background-color: var(--color-base-100, #ffffff);
    color: var(--color-text, #1f2937);
    overflow: auto;
  }
  
  .preview-content {
    padding: 1.25rem;
    min-height: 100%;
  }
  
  :global(.dark) .editor-panel,
  :global(.dark) .preview-panel {
    background-color: var(--color-base-100-dark, #1e293b);
    border-color: var(--color-base-300-dark, #374151);
  }
  
  :global(.dark) .editor-textarea {
    background-color: var(--color-base-100-dark, #1e293b);
    color: var(--color-text-dark, #f3f4f6);
  }
  
  @media (min-width: 768px) {
    .preview-panel {
      border-left: 1px solid var(--color-base-300, #e5e7eb);
      border-top: none;
    }
    
    :global(.dark) .preview-panel {
      border-left-color: var(--color-base-300-dark, #374151);
    }
  }
  
  @media (max-width: 767px) {
    .preview-panel {
      border-top: 1px solid var(--color-base-300, #e5e7eb);
    }
    
    :global(.dark) .preview-panel {
      border-top-color: var(--color-base-300-dark, #374151);
    }
  }
  
  .buttons-container {
    display: inline-block;
  }
  
  .export-btn, 
  .settings-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 8px 16px;
    margin-left: 10px;
    border-radius: 6px;
    background-color: transparent;
    border: 1px solid #e5e7eb;
    font-weight: 500;
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
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }
  
  :global(.dark) .export-btn:hover, 
  :global(.dark) .settings-btn:hover {
    background-color: rgba(255, 255, 255, 0.05);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
  
  .export-btn:active, 
  .settings-btn:active {
    transform: translateY(0);
    box-shadow: none;
  }
  
  /* 表格容器样式 */
  :global(.prose .table-container) {
    max-width: 100%;
    overflow-x: auto;
    margin: 1rem 0;
    border-radius: 4px;
  }
  
  :global(.dark .prose .table-container) {
    /* 暗色模式下没有额外样式 */
  }
  
  /* 表格样式 */
  :global(.prose .md-table) {
    border-collapse: collapse;
    width: auto;
    min-width: 100%;
    font-size: 0.9em;
    overflow: hidden;
  }
  
  :global(.prose .md-table th) {
    background-color: #f3f4f6;
    color: #1f2937;
    font-weight: 600;
    padding: 0.5rem 0.75rem;
    text-align: left;
    border-bottom: 2px solid #e5e7eb;
    white-space: nowrap;
  }
  
  :global(.dark .prose .md-table th) {
    background-color: #374151;
    color: #f3f4f6;
    border-bottom: 2px solid #4b5563;
  }
  
  :global(.prose .md-table td) {
    padding: 0.5rem 0.75rem;
    border-bottom: 1px solid #e5e7eb;
    max-width: 20rem;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  :global(.dark .prose .md-table td) {
    border-bottom: 1px solid #4b5563;
  }
  
  :global(.prose .md-table tr:last-child td) {
    border-bottom: none;
  }
  
  :global(.prose .md-table tr:nth-child(even)) {
    background-color: #f9fafb;
  }
  
  :global(.dark .prose .md-table tr:nth-child(even)) {
    background-color: #1e293b;
  }
  
  :global(.prose .md-table tr:hover) {
    background-color: #f3f4f6;
  }
  
  :global(.dark .prose .md-table tr:hover) {
    background-color: #374151;
  }
  
  /* 代码块样式 */
  :global(.prose pre), 
  :global(.prose .code-block) {
    background-color: #f5f7fa;
    border-radius: 6px;
    padding: 1rem;
    overflow-x: auto;
    margin: 1.5rem 0;
  }
  
  :global(.dark .prose pre),
  :global(.dark .prose .code-block) {
    background-color: #1e293b;
  }
  
  :global(.prose code),
  :global(.prose .code-inline) {
    background-color: #f1f5f9;
    border-radius: 4px;
    padding: 0.2em 0.4em;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.9em;
  }
  
  :global(.dark .prose code),
  :global(.dark .prose .code-inline) {
    background-color: #283548;
  }
  
  :global(.prose pre code) {
    background-color: transparent;
    padding: 0;
    border-radius: 0;
  }
  
  /* 公式样式 */
  :global(.prose .math-block) {
    background-color: #f8fafc;
    padding: 1rem;
    border-radius: 6px;
    margin: 1.5rem 0;
    overflow-x: auto;
  }
  
  :global(.dark .prose .math-block) {
    background-color: #1e293b;
  }
  
  :global(.prose .math-inline) {
    background-color: #f1f5f9;
    border-radius: 4px;
    padding: 0.1em 0.2em;
  }
  
  :global(.dark .prose .math-inline) {
    background-color: #283548;
  }
  
  :global(.dark) .toolbar-container {
    background-color: var(--color-base-100-dark, #1e293b);
    border-color: var(--color-base-300-dark, #374151);
  }
</style> 