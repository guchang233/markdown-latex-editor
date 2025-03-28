<script>
  import { createEventDispatcher } from 'svelte';
  import ThemeToggle from './ThemeToggle.svelte';

  // 事件分发器
  const dispatch = createEventDispatcher();

  // 定义工具栏按钮
  const markdownTools = [
    { id: 'heading1', icon: 'H1', title: '一级标题', action: () => insertMarkdown('# ', '', 'heading') },
    { id: 'heading2', icon: 'H2', title: '二级标题', action: () => insertMarkdown('## ', '', 'heading') },
    { id: 'heading3', icon: 'H3', title: '三级标题', action: () => insertMarkdown('### ', '', 'heading') },
    { id: 'bold', icon: 'B', title: '粗体', action: () => insertMarkdown('**', '**', 'formatting') },
    { id: 'italic', icon: 'I', title: '斜体', action: () => insertMarkdown('*', '*', 'formatting') },
    { id: 'strikethrough', icon: 'S', title: '删除线', action: () => insertMarkdown('~~', '~~', 'formatting') },
    { id: 'code', icon: '`', title: '行内代码', action: () => insertMarkdown('`', '`', 'formatting') },
    { id: 'link', icon: '🔗', title: '链接', action: () => insertMarkdown('[链接文本](', ')', 'link') },
    { id: 'image', icon: '🖼️', title: '图片', action: () => insertMarkdown('![描述](', ')', 'image') },
    { id: 'blockquote', icon: '❝', title: '引用', action: () => insertMarkdown('> ', '', 'blockquote') },
    { id: 'ul', icon: '•', title: '无序列表', action: () => insertMarkdown('- ', '', 'list') },
    { id: 'ol', icon: '1.', title: '有序列表', action: () => insertMarkdown('1. ', '', 'list') },
    { id: 'task', icon: '☑️', title: '任务列表', action: () => insertMarkdown('- [ ] ', '', 'task') },
    { id: 'table', icon: '📊', title: '表格', action: insertTable },
    { id: 'hr', icon: '—', title: '分隔线', action: () => insertMarkdown('---\n', '', 'hr') }
  ];

  const latexTools = [
    { id: 'inline-math', icon: 'fx', title: '行内公式', action: () => insertMarkdown('$', '$', 'latex-inline') },
    { id: 'block-math', icon: '∫', title: '块级公式', action: () => insertMarkdown('$$\n', '\n$$', 'latex-block') },
    { id: 'fraction', icon: '½', title: '分数', action: () => insertMarkdown('\\frac{', '}{denominator}', 'latex-func') },
    { id: 'sqrt', icon: '√', title: '平方根', action: () => insertMarkdown('\\sqrt{', '}', 'latex-func') },
    { id: 'sum', icon: '∑', title: '求和', action: () => insertMarkdown('\\sum_{i=1}^{n}{', '}', 'latex-func') },
    { id: 'integral', icon: '∫', title: '积分', action: () => insertMarkdown('\\int_{a}^{b}{', '}\\,dx', 'latex-func') },
    { id: 'limit', icon: 'lim', title: '极限', action: () => insertMarkdown('\\lim_{x \\to \\infty}{', '}', 'latex-func') },
    { id: 'matrix', icon: '⊞', title: '矩阵', action: insertMatrix }
  ];

  // 功能实现
  function insertMarkdown(prefix, suffix, type) {
    dispatch('action', {
      type,
      prefix,
      suffix,
      replaceSelection: true
    });
  }

  function insertTable() {
    const tableTemplate = '| 表头1 | 表头2 | 表头3 |\n| --- | --- | --- |\n| 单元格1 | 单元格2 | 单元格3 |\n| 单元格4 | 单元格5 | 单元格6 |';
    
    dispatch('action', {
      type: 'table',
      content: tableTemplate,
      replaceSelection: false
    });
  }

  function insertMatrix() {
    const matrixTemplate = "\\begin{bmatrix}\n  a & b & c \\\\\n  d & e & f \\\\\n  g & h & i\n\\end{bmatrix}";
    
    dispatch('action', {
      type: 'latex-matrix',
      content: matrixTemplate,
      replaceSelection: false
    });
  }

  // 工具栏显示区域控制
  let showLatexTools = false;
  
  function toggleLatexTools() {
    showLatexTools = !showLatexTools;
  }

  // 导出功能
  function exportAsHTML() {
    dispatch('export', { format: 'html' });
  }

  function exportAsPDF() {
    dispatch('export', { format: 'pdf' });
  }

  function exportAsMarkdown() {
    dispatch('export', { format: 'markdown' });
  }
</script>

<div class="toolbar">
  <div class="toolbar-section markdown-tools">
    {#each markdownTools as tool}
      <button 
        class="toolbar-button" 
        title={tool.title} 
        on:click={tool.action}>
        <span class="icon">{tool.icon}</span>
      </button>
    {/each}
  </div>
  
  <div class="toolbar-separator"></div>
  
  <div class="toolbar-section latex-toggle">
    <button 
      class="toolbar-button special" 
      class:active={showLatexTools}
      on:click={toggleLatexTools}
      title="LaTeX公式工具">
      <span class="icon">∑</span>
      <span class="text">LaTeX</span>
    </button>
  </div>
  
  {#if showLatexTools}
    <div class="toolbar-section latex-tools fade-in">
      {#each latexTools as tool}
        <button 
          class="toolbar-button" 
          title={tool.title} 
          on:click={tool.action}>
          <span class="icon">{tool.icon}</span>
        </button>
      {/each}
    </div>
  {/if}
  
  <div class="toolbar-spacer"></div>
  
  <div class="toolbar-section extra-tools">
    <div class="dropdown">
      <button class="toolbar-button" title="导出文档">
        <span class="icon">📥</span>
      </button>
      <div class="dropdown-content">
        <button on:click={exportAsHTML}>导出为HTML</button>
        <button on:click={exportAsPDF}>导出为PDF</button>
        <button on:click={exportAsMarkdown}>导出为Markdown</button>
      </div>
    </div>
    
    <ThemeToggle />
  </div>
</div>

<style>
  .toolbar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.25rem;
    padding: 0.5rem;
    background-color: var(--color-bg-code-light);
    border-bottom: 1px solid var(--color-border-light);
    position: relative;
  }
  
  :global(.dark) .toolbar {
    background-color: var(--color-bg-code-dark);
    border-color: var(--color-border-dark);
  }
  
  .toolbar-section {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
  }
  
  .toolbar-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: var(--radius-sm);
    background-color: transparent;
    color: var(--color-text-muted-light);
    border: none;
    cursor: pointer;
    transition: var(--transition-normal);
    font-size: 0.85rem;
    font-weight: 500;
  }
  
  .toolbar-button.special {
    width: auto;
    padding: 0 10px;
  }
  
  .toolbar-button .text {
    margin-left: 4px;
    display: none;
  }
  
  @media (min-width: 640px) {
    .toolbar-button.special .text {
      display: inline;
    }
  }
  
  :global(.dark) .toolbar-button {
    color: var(--color-text-muted-dark);
  }
  
  .toolbar-button:hover {
    background-color: rgba(0, 0, 0, 0.05);
    color: var(--color-primary);
  }
  
  :global(.dark) .toolbar-button:hover {
    background-color: rgba(255, 255, 255, 0.05);
    color: var(--color-primary-light);
  }
  
  .toolbar-button.active {
    background-color: var(--color-primary);
    color: white;
  }
  
  .toolbar-separator {
    width: 1px;
    height: 24px;
    margin: 0 0.5rem;
    background-color: var(--color-border-light);
  }
  
  :global(.dark) .toolbar-separator {
    background-color: var(--color-border-dark);
  }
  
  .toolbar-spacer {
    flex: 1;
  }
  
  .latex-tools {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    background-color: var(--color-bg-light);
    border-radius: var(--radius);
    box-shadow: var(--shadow-sm);
    padding: 0.25rem;
  }
  
  :global(.dark) .latex-tools {
    background-color: var(--color-bg-code-dark);
  }
  
  /* Dropdown styles */
  .dropdown {
    position: relative;
    display: inline-block;
  }
  
  .dropdown-content {
    display: none;
    position: absolute;
    right: 0;
    top: 100%;
    min-width: 160px;
    background-color: var(--color-bg-light);
    box-shadow: var(--shadow-md);
    border-radius: var(--radius);
    z-index: 100;
    padding: 0.5rem 0;
  }
  
  :global(.dark) .dropdown-content {
    background-color: var(--color-bg-dark);
  }
  
  .dropdown:hover .dropdown-content {
    display: block;
  }
  
  .dropdown-content button {
    display: block;
    width: 100%;
    padding: 0.5rem 1rem;
    text-align: left;
    background: none;
    border: none;
    color: var(--color-text-light);
    cursor: pointer;
    font-size: 0.9rem;
  }
  
  :global(.dark) .dropdown-content button {
    color: var(--color-text-dark);
  }
  
  .dropdown-content button:hover {
    background-color: var(--color-bg-code-light);
    color: var(--color-primary);
  }
  
  :global(.dark) .dropdown-content button:hover {
    background-color: var(--color-bg-code-dark);
    color: var(--color-primary-light);
  }
</style> 