<script>
  import { onMount } from 'svelte';
  import { renderMarkdown, extractLatexFormulas, validateLatexFormula } from './utils/markdown';
  import EditorToolbar from './EditorToolbar.svelte';
  import StatusBar from './StatusBar.svelte';
  import HelpDialog from './HelpDialog.svelte';
  import { bindEditorShortcuts, createTextActions } from './utils/shortcuts';
  
  // 编辑器状态
  let markdownText = '';
  let renderedHtml = '';
  let editorElement;
  let previewElement;
  let isFullscreen = false;
  let showPreview = true;
  let saveTimeout;
  let autoSave = true;
  let wordCount = 0;
  let charCount = 0;
  let currentLatexError = null;
  let currentFileName = 'untitled.md';
  let isSaved = true;
  let showHelpDialog = false;
  
  // LaTeX公式状态跟踪
  let latexFormulas = { inline: [], block: [] };
  
  // 编辑器配置
  let editorConfig = {
    tabSize: 2,
    indentWithTabs: false,
    spellCheck: true,
    autoCloseBrackets: true,
    autoCloseMarkdown: true
  };
  
  // 渲染Markdown和更新统计信息
  function updatePreview() {
    try {
      renderedHtml = renderMarkdown(markdownText);
      latexFormulas = extractLatexFormulas(markdownText);
      
      // 更新字数和字符统计
      updateWordAndCharCount();
      
      // 自动保存
      if (autoSave) {
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(saveDocument, 2000);
        isSaved = false;
      }
    } catch (error) {
      console.error('预览更新错误:', error);
    }
  }
  
  // 更新字数和字符统计
  function updateWordAndCharCount() {
    // 简单的字数统计 (按空格分割)
    const text = markdownText.trim();
    charCount = text.length;
    wordCount = text ? text.split(/\s+/).length : 0;
  }
  
  // 处理工具栏动作
  function handleToolbarAction(event) {
    const { type, prefix, suffix, content, replaceSelection } = event.detail;
    
    if (!editorElement) return;
    
    if (content) {
      // 插入完整内容 (如表格模板)
      const selection = window.getSelection();
      const range = selection.getRangeAt(0);
      const startPos = getCaretPosition(editorElement);
      
      // 插入新内容
      const newText = markdownText.substring(0, startPos) + 
                      '\n' + content + '\n' + 
                      markdownText.substring(startPos);
                      
      markdownText = newText;
      
      // 更新后重新设置光标位置
      setTimeout(() => {
        setCaretPosition(editorElement, startPos + content.length + 2);
      }, 0);
    } else if (prefix || suffix) {
      // 插入前缀/后缀 (如格式化)
      const selection = window.getSelection();
      const selectedText = selection.toString();
      const range = selection.getRangeAt(0);
      
      const startPos = getCaretPosition(editorElement);
      const endPos = startPos + selectedText.length;
      
      let newText;
      if (selectedText.length > 0 && replaceSelection) {
        // 替换选中的文本
        newText = markdownText.substring(0, startPos) + 
                  prefix + selectedText + suffix + 
                  markdownText.substring(endPos);
                  
        markdownText = newText;
        
        // 选中插入的内容
        setTimeout(() => {
          setCaretPosition(editorElement, startPos + prefix.length, selectedText.length);
        }, 0);
      } else {
        // 没有选中，只插入标记
        newText = markdownText.substring(0, startPos) + 
                  prefix + suffix + 
                  markdownText.substring(startPos);
                  
        markdownText = newText;
        
        // 将光标放在前缀和后缀之间
        setTimeout(() => {
          setCaretPosition(editorElement, startPos + prefix.length);
        }, 0);
      }
    }
    
    // 更新预览
    updatePreview();
  }
  
  // 处理导出操作
  function handleExport(event) {
    const { format } = event.detail;
    
    switch (format) {
      case 'html':
        exportAsHTML();
        break;
      case 'pdf':
        exportAsPDF();
        break;
      case 'markdown':
        exportAsMarkdown();
        break;
    }
  }
  
  // 导出为HTML
  function exportAsHTML() {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${currentFileName.replace('.md', '')}</title>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.4/dist/katex.min.css">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 1rem;
          }
          pre, code {
            background-color: #f3f4f6;
            border-radius: 3px;
          }
          pre {
            padding: 1rem;
            overflow-x: auto;
          }
          code {
            padding: 0.2em 0.4em;
            font-family: monospace;
          }
          img {
            max-width: 100%;
          }
          blockquote {
            border-left: 4px solid #ccc;
            padding-left: 1rem;
            color: #666;
          }
          table {
            border-collapse: collapse;
            width: 100%;
          }
          table th, table td {
            border: 1px solid #ddd;
            padding: 0.5rem;
          }
          table th {
            background-color: #f3f4f6;
          }
          .katex-display {
            overflow-x: auto;
            overflow-y: hidden;
          }
        </style>
      </head>
      <body>
        ${renderedHtml}
      </body>
      </html>
    `;
    
    downloadFile(htmlContent, currentFileName.replace('.md', '.html'), 'text/html');
  }
  
  // 导出为PDF (使用打印API)
  function exportAsPDF() {
    const printWindow = window.open('', '_blank');
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${currentFileName.replace('.md', '')}</title>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.4/dist/katex.min.css">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 1rem;
          }
          pre, code {
            background-color: #f3f4f6;
            border-radius: 3px;
          }
          pre {
            padding: 1rem;
            overflow-x: auto;
          }
          code {
            padding: 0.2em 0.4em;
            font-family: monospace;
          }
          img {
            max-width: 100%;
          }
          blockquote {
            border-left: 4px solid #ccc;
            padding-left: 1rem;
            color: #666;
          }
          table {
            border-collapse: collapse;
            width: 100%;
          }
          table th, table td {
            border: 1px solid #ddd;
            padding: 0.5rem;
          }
          table th {
            background-color: #f3f4f6;
          }
          @media print {
            body {
              font-size: 12pt;
            }
            pre, code {
              font-size: 10pt;
            }
          }
        </style>
      </head>
      <body>
        ${renderedHtml}
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
              window.close();
            }, 500);
          }
        </script>
      </body>
      </html>
    `);
    
    printWindow.document.close();
  }
  
  // 导出为Markdown
  function exportAsMarkdown() {
    downloadFile(markdownText, currentFileName, 'text/markdown');
  }
  
  // 下载文件工具函数
  function downloadFile(content, filename, contentType) {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    
    URL.revokeObjectURL(url);
  }
  
  // 保存文档
  function saveDocument() {
    localStorage.setItem('marktext-document', markdownText);
    localStorage.setItem('marktext-filename', currentFileName);
    isSaved = true;
  }
  
  // 加载保存的文档
  function loadSavedDocument() {
    const savedText = localStorage.getItem('marktext-document');
    const savedFilename = localStorage.getItem('marktext-filename');
    
    if (savedText) {
      markdownText = savedText;
    } else {
      markdownText = `# 欢迎使用 MarkTeX 编辑器

这是一个强大的 Markdown 和 LaTeX 公式编辑器，支持多种格式化选项和公式输入。

## Markdown 示例

- **粗体文本** 和 *斜体文本*
- [链接](https://example.com)
- 代码 \`const x = 1\`

## LaTeX 公式示例

行内公式: $E = mc^2$

块级公式:

$$
\\int_{a}^{b} f(x) \\, dx = F(b) - F(a)
$$

尝试编辑上面的内容，或使用工具栏添加新的格式！
`;
    }
    
    if (savedFilename) {
      currentFileName = savedFilename;
    }
    
    updatePreview();
  }
  
  // 切换全屏
  function toggleFullscreen() {
    isFullscreen = !isFullscreen;
    
    if (isFullscreen) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }
  
  // 切换预览
  function togglePreview() {
    showPreview = !showPreview;
  }
  
  // 处理光标位置变化
  function handleSelectionChange() {
    if (!editorElement) return;
    
    // 检测当前光标是否在 LaTeX 公式内
    const cursorPos = getCaretPosition(editorElement);
    let inLatexFormula = false;
    let currentFormula = '';
    
    // 检查是否在内联LaTeX公式中
    for (let i = 0; i < markdownText.length; i++) {
      if (markdownText[i] === '$') {
        // 找到第一个 $
        let j = i + 1;
        while (j < markdownText.length && markdownText[j] !== '$') {
          j++;
        }
        
        // 如果找到了闭合的 $，并且光标在这之间
        if (j < markdownText.length && cursorPos > i && cursorPos <= j) {
          inLatexFormula = true;
          currentFormula = markdownText.substring(i + 1, j);
          break;
        }
        
        i = j;
      }
    }
    
    // 检查是否在块级LaTeX公式中
    if (!inLatexFormula) {
      const blockRegex = /\$\$([\s\S]*?)\$\$/g;
      let match;
      while ((match = blockRegex.exec(markdownText)) !== null) {
        const startPos = match.index;
        const endPos = startPos + match[0].length;
        
        if (cursorPos > startPos && cursorPos <= endPos) {
          inLatexFormula = true;
          currentFormula = match[1];
          break;
        }
      }
    }
    
    // 如果在LaTeX公式中，验证语法
    if (inLatexFormula && currentFormula) {
      const result = validateLatexFormula(currentFormula);
      if (!result.isValid) {
        currentLatexError = result.error;
      } else {
        currentLatexError = null;
      }
    } else {
      currentLatexError = null;
    }
  }
  
  // 辅助函数 - 获取光标位置
  function getCaretPosition(element) {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const preCaretRange = range.cloneRange();
      preCaretRange.selectNodeContents(element);
      preCaretRange.setEnd(range.endContainer, range.endOffset);
      return preCaretRange.toString().length;
    }
    return 0;
  }
  
  // 辅助函数 - 设置光标位置
  function setCaretPosition(element, position, length = 0) {
    // 文本节点和偏移
    let currentNode = element.firstChild;
    let offset = 0;
    
    // 找到正确的文本节点
    while (currentNode) {
      if (currentNode.nodeType === Node.TEXT_NODE) {
        if (offset + currentNode.length >= position) {
          const range = document.createRange();
          const selection = window.getSelection();
          
          range.setStart(currentNode, position - offset);
          
          if (length > 0) {
            range.setEnd(currentNode, position - offset + length);
          } else {
            range.collapse(true);
          }
          
          selection.removeAllRanges();
          selection.addRange(range);
          break;
        }
        
        offset += currentNode.length;
      } else if (currentNode.nodeType === Node.ELEMENT_NODE) {
        // 处理元素节点 (如换行等)
        if (currentNode.tagName === 'BR') {
          offset += 1;
        }
      }
      
      currentNode = currentNode.nextSibling;
    }
  }
  
  // 文件拖拽处理
  function handleFileDrop(event) {
    event.preventDefault();
    
    if (event.dataTransfer.items) {
      for (let i = 0; i < event.dataTransfer.items.length; i++) {
        if (event.dataTransfer.items[i].kind === 'file') {
          const file = event.dataTransfer.items[i].getAsFile();
          
          if (file.type === 'text/markdown' || file.name.endsWith('.md')) {
            readMarkdownFile(file);
          } else if (file.type.startsWith('image/')) {
            // 未来可以实现图片上传
            alert('图片上传功能正在开发中');
          }
        }
      }
    }
  }
  
  // 读取Markdown文件
  function readMarkdownFile(file) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
      markdownText = e.target.result;
      currentFileName = file.name;
      updatePreview();
    };
    
    reader.readAsText(file);
  }
  
  // 同步滚动
  function syncScroll(event) {
    if (!previewElement || !editorElement || !showPreview) return;
    
    const source = event.target;
    const target = source === editorElement ? previewElement : editorElement;
    
    const sourceScrollPercentage = source.scrollTop / (source.scrollHeight - source.clientHeight);
    target.scrollTop = sourceScrollPercentage * (target.scrollHeight - target.clientHeight);
  }
  
  // 显示帮助对话框
  function showHelp() {
    showHelpDialog = true;
  }
  
  // 初始化编辑器
  onMount(() => {
    // 加载保存的文档
    loadSavedDocument();
    
    // 设置内容可编辑
    if (editorElement) {
      editorElement.focus();
    }
    
    // 监听选择变化
    document.addEventListener('selectionchange', handleSelectionChange);
    
    // 监听滚动
    if (editorElement) {
      editorElement.addEventListener('scroll', syncScroll);
    }
    
    if (previewElement) {
      previewElement.addEventListener('scroll', syncScroll);
    }
    
    // 绑定快捷键
    const editorActions = {
      insertFormatting: (prefix, suffix) => {
        if (!editorElement) return;
        
        const selection = window.getSelection();
        const selectedText = selection.toString();
        
        const startPos = getCaretPosition(editorElement);
        const endPos = startPos + selectedText.length;
        
        let newText;
        if (selectedText.length > 0) {
          // 替换选中的文本
          newText = markdownText.substring(0, startPos) + 
                   prefix + selectedText + suffix + 
                   markdownText.substring(endPos);
                   
          markdownText = newText;
          
          // 选中插入的内容
          setTimeout(() => {
            setCaretPosition(editorElement, startPos + prefix.length, selectedText.length);
          }, 0);
        } else {
          // 没有选中，只插入标记
          newText = markdownText.substring(0, startPos) + 
                   prefix + suffix + 
                   markdownText.substring(startPos);
                   
          markdownText = newText;
          
          // 将光标放在前缀和后缀之间
          setTimeout(() => {
            setCaretPosition(editorElement, startPos + prefix.length);
          }, 0);
        }
        
        updatePreview();
      },
      saveDocument,
      openDocument: () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.md,.markdown,.txt';
        input.onchange = (e) => {
          const file = e.target.files[0];
          if (file) {
            readMarkdownFile(file);
          }
        };
        input.click();
      },
      printDocument: exportAsPDF,
      togglePreview,
      toggleFullscreen
    };
    
    const textActions = createTextActions(editorElement, editorActions);
    const cleanupShortcuts = bindEditorShortcuts(document, textActions);
    
    // 添加窗口关闭提示
    window.addEventListener('beforeunload', (e) => {
      if (!isSaved) {
        e.preventDefault();
        e.returnValue = '';
      }
    });
    
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
      
      if (editorElement) {
        editorElement.removeEventListener('scroll', syncScroll);
      }
      
      if (previewElement) {
        previewElement.removeEventListener('scroll', syncScroll);
      }
      
      clearTimeout(saveTimeout);
      cleanupShortcuts();
    };
  });
</script>

<div 
  class="editor-container" 
  class:fullscreen={isFullscreen}>
  
  <EditorToolbar 
    on:action={handleToolbarAction}
    on:export={handleExport} />
  
  <div class="editor-preview-container">
    <!-- 编辑器面板 -->
    <div 
      class="editor-pane"
      class:full-width={!showPreview}>
      <div 
        bind:this={editorElement}
        class="editor-content" 
        contenteditable="true"
        bind:innerHTML={markdownText}
        on:input={updatePreview}
        on:paste={(e) => {
          e.preventDefault();
          const text = e.clipboardData.getData('text/plain');
          document.execCommand('insertText', false, text);
        }}
        on:dragover={(e) => e.preventDefault()}
        on:drop={handleFileDrop}
        spellcheck={editorConfig.spellCheck}></div>
    </div>
    
    <!-- 预览面板 -->
    {#if showPreview}
      <div bind:this={previewElement} class="preview-pane">
        <div class="preview-content">
          {@html renderedHtml}
        </div>
      </div>
    {/if}
  </div>
  
  <!-- 状态栏 -->
  <StatusBar 
    {wordCount}
    {charCount}
    {currentLatexError}
    {isSaved}
    {currentFileName} />
  
  <!-- 浮动操作按钮 -->
  <div class="float-actions">
    <button 
      class="float-button preview-toggle"
      on:click={togglePreview}
      title={showPreview ? "隐藏预览" : "显示预览"}>
      {#if showPreview}
        <!-- 隐藏预览图标 -->
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
          <line x1="1" y1="1" x2="23" y2="23"></line>
        </svg>
      {:else}
        <!-- 显示预览图标 -->
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>
      {/if}
    </button>
    
    <button 
      class="float-button fullscreen-toggle"
      on:click={toggleFullscreen}
      title={isFullscreen ? "退出全屏" : "全屏模式"}>
      {#if isFullscreen}
        <!-- 退出全屏图标 -->
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path>
        </svg>
      {:else}
        <!-- 进入全屏图标 -->
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
        </svg>
      {/if}
    </button>
    
    <button 
      class="float-button help-button"
      on:click={showHelp}
      title="帮助">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
      </svg>
    </button>
  </div>
</div>

<!-- 添加帮助对话框组件 -->
<HelpDialog bind:isOpen={showHelpDialog} />

<style>
  /* 编辑器容器 */
  .editor-container {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100vh;
    background-color: var(--color-bg-light);
    position: relative;
  }
  
  :global(.dark) .editor-container {
    background-color: var(--color-bg-dark);
  }
  
  .editor-container.fullscreen {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 9999;
  }
  
  /* 编辑器和预览区域 */
  .editor-preview-container {
    display: flex;
    flex: 1;
    overflow: hidden;
  }
  
  /* 编辑器面板 */
  .editor-pane {
    flex: 1;
    overflow: auto;
    border-right: 1px solid var(--color-border-light);
    transition: flex 0.3s ease;
  }
  
  :global(.dark) .editor-pane {
    border-color: var(--color-border-dark);
  }
  
  .editor-pane.full-width {
    flex: 1;
  }
  
  .editor-content {
    font-family: var(--font-mono);
    font-size: 14px;
    line-height: 1.6;
    padding: 1rem;
    min-height: 100%;
    outline: none;
    white-space: pre-wrap;
    word-break: break-word;
    color: var(--color-text-light);
  }
  
  :global(.dark) .editor-content {
    color: var(--color-text-dark);
  }
  
  /* 预览面板 */
  .preview-pane {
    flex: 1;
    overflow: auto;
    padding: 1rem;
    background-color: var(--color-bg-light);
  }
  
  :global(.dark) .preview-pane {
    background-color: var(--color-bg-dark);
  }
  
  /* 浮动操作按钮 */
  .float-actions {
    position: fixed;
    bottom: 1.5rem;
    right: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    z-index: 100;
  }
  
  .float-button {
    width: 46px;
    height: 46px;
    border-radius: 50%;
    background-color: var(--color-primary);
    color: white;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: var(--shadow-lg);
    transition: var(--transition-normal);
  }
  
  .float-button:hover {
    background-color: var(--color-primary-dark);
    transform: translateY(-2px);
  }
  
  .preview-toggle {
    background-color: var(--color-secondary);
  }
  
  .preview-toggle:hover {
    background-color: var(--color-secondary);
    opacity: 0.9;
  }
  
  .help-button {
    background-color: var(--color-warning);
  }
  
  .help-button:hover {
    background-color: var(--color-warning);
    opacity: 0.9;
  }
</style> 