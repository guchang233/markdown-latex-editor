<script>
  import { getShortcutsList } from './utils/shortcuts';
  
  export let isOpen = false;
  
  // 快捷键列表
  const shortcuts = getShortcutsList();
  
  // 关闭帮助对话框
  function closeHelp() {
    isOpen = false;
  }
  
  // 切换标签页
  let activeTab = 'shortcuts';
  function setActiveTab(tab) {
    activeTab = tab;
  }
</script>

{#if isOpen}
  <div class="help-dialog-overlay" on:click={closeHelp}></div>
  
  <div class="help-dialog">
    <header class="help-dialog-header">
      <h2>MarkTeX 编辑器帮助</h2>
      <button class="close-button" on:click={closeHelp} aria-label="关闭帮助">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </header>
    
    <div class="tabs">
      <button 
        class="tab" 
        class:active={activeTab === 'shortcuts'} 
        on:click={() => setActiveTab('shortcuts')}>
        快捷键
      </button>
      <button 
        class="tab" 
        class:active={activeTab === 'markdown'} 
        on:click={() => setActiveTab('markdown')}>
        Markdown 语法
      </button>
      <button 
        class="tab" 
        class:active={activeTab === 'latex'} 
        on:click={() => setActiveTab('latex')}>
        LaTeX 公式
      </button>
      <button 
        class="tab" 
        class:active={activeTab === 'about'} 
        on:click={() => setActiveTab('about')}>
        关于
      </button>
    </div>
    
    <div class="help-content">
      {#if activeTab === 'shortcuts'}
        <section class="shortcuts-section">
          <h3>键盘快捷键</h3>
          <table class="shortcuts-table">
            <thead>
              <tr>
                <th>快捷键</th>
                <th>描述</th>
              </tr>
            </thead>
            <tbody>
              {#each shortcuts as shortcut}
                <tr>
                  <td><kbd>{shortcut.key}</kbd></td>
                  <td>{shortcut.description}</td>
                </tr>
              {/each}
            </tbody>
          </table>
        </section>
      {:else if activeTab === 'markdown'}
        <section class="markdown-section">
          <h3>Markdown 基本语法</h3>
          
          <div class="syntax-grid">
            <div class="syntax-item">
              <h4>标题</h4>
              <pre># 一级标题
## 二级标题
### 三级标题</pre>
            </div>
            
            <div class="syntax-item">
              <h4>强调</h4>
              <pre>**粗体文本**
*斜体文本*
~~删除线文本~~</pre>
            </div>
            
            <div class="syntax-item">
              <h4>列表</h4>
              <pre>- 无序列表项
- 另一个项目

1. 有序列表项
2. 另一个项目

- [ ] 任务项
- [x] 已完成任务</pre>
            </div>
            
            <div class="syntax-item">
              <h4>链接和图片</h4>
              <pre>[链接文本](https://example.com)
![图片描述](image.jpg)</pre>
            </div>
            
            <div class="syntax-item">
              <h4>引用</h4>
              <pre>> 这是一段引用文本
> 可以包含多行</pre>
            </div>
            
            <div class="syntax-item">
              <h4>代码</h4>
              <pre>`行内代码`

```
代码块
多行代码
```</pre>
            </div>
            
            <div class="syntax-item">
              <h4>表格</h4>
              <pre>| 表头1 | 表头2 |
| ----- | ----- |
| 单元格 | 单元格 |
| 单元格 | 单元格 |</pre>
            </div>
            
            <div class="syntax-item">
              <h4>水平线</h4>
              <pre>---</pre>
            </div>
          </div>
        </section>
      {:else if activeTab === 'latex'}
        <section class="latex-section">
          <h3>LaTeX 数学公式</h3>
          
          <div class="syntax-grid">
            <div class="syntax-item">
              <h4>基本语法</h4>
              <pre>行内公式: $E = mc^2$

块级公式:
$$
E = mc^2
$$</pre>
            </div>
            
            <div class="syntax-item">
              <h4>上标和下标</h4>
              <pre>$x^2$ (上标)
$x_i$ (下标)
$x_i^2$ (同时使用)</pre>
            </div>
            
            <div class="syntax-item">
              <h4>分数</h4>
              <pre>$\frac{分子}{分母}$

例如: $\frac{1}{2}$</pre>
            </div>
            
            <div class="syntax-item">
              <h4>根号</h4>
              <pre>$\sqrt{x}$ (平方根)
$\sqrt[n]{x}$ (n次方根)</pre>
            </div>
            
            <div class="syntax-item">
              <h4>求和与积分</h4>
              <pre>$\sum_{i=1}^{n} i$

$\int_{a}^{b} f(x) \, dx$</pre>
            </div>
            
            <div class="syntax-item">
              <h4>矩阵</h4>
              <pre>$$
\begin{bmatrix}
  a & b \\
  c & d
\end{bmatrix}
$$</pre>
            </div>
            
            <div class="syntax-item">
              <h4>希腊字母</h4>
              <pre>$\alpha, \beta, \gamma$
$\delta, \epsilon, \zeta$
$\eta, \theta, \iota$</pre>
            </div>
            
            <div class="syntax-item">
              <h4>常用符号</h4>
              <pre>$\infty$ (无穷)
$\approx$ (约等于)
$\neq$ (不等于)
$\geq$ (大于等于)</pre>
            </div>
          </div>
        </section>
      {:else if activeTab === 'about'}
        <section class="about-section">
          <h3>关于 MarkTeX 编辑器</h3>
          
          <p>MarkTeX 是一款强大的 Markdown 和 LaTeX 公式编辑器，专为科学写作、学术笔记和技术文档而设计。</p>
          
          <h4>主要特性:</h4>
          <ul>
            <li>集成 Markdown 和 LaTeX 公式支持</li>
            <li>实时预览</li>
            <li>黑暗模式</li>
            <li>导出为 HTML、PDF 和 Markdown</li>
            <li>多种编辑工具和快捷键</li>
            <li>自动保存</li>
            <li>本地存储</li>
          </ul>
          
          <p class="version">版本: 1.0.0</p>
          <p class="copyright">© 2023 MarkTeX 团队</p>
        </section>
      {/if}
    </div>
  </div>
{/if}

<style>
  .help-dialog-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 1000;
  }
  
  .help-dialog {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 90%;
    max-width: 800px;
    max-height: 80vh;
    background-color: var(--color-bg-light);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    z-index: 1001;
  }
  
  :global(.dark) .help-dialog {
    background-color: var(--color-bg-dark);
  }
  
  .help-dialog-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    border-bottom: 1px solid var(--color-border-light);
  }
  
  :global(.dark) .help-dialog-header {
    border-color: var(--color-border-dark);
  }
  
  .help-dialog-header h2 {
    margin: 0;
    font-size: 1.25rem;
    color: var(--color-text-light);
  }
  
  :global(.dark) .help-dialog-header h2 {
    color: var(--color-text-dark);
  }
  
  .close-button {
    background: none;
    border: none;
    color: var(--color-text-muted-light);
    cursor: pointer;
    padding: 0.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius);
  }
  
  :global(.dark) .close-button {
    color: var(--color-text-muted-dark);
  }
  
  .close-button:hover {
    background-color: rgba(0, 0, 0, 0.05);
    color: var(--color-text-light);
  }
  
  :global(.dark) .close-button:hover {
    background-color: rgba(255, 255, 255, 0.05);
    color: var(--color-text-dark);
  }
  
  .tabs {
    display: flex;
    border-bottom: 1px solid var(--color-border-light);
    overflow-x: auto;
  }
  
  :global(.dark) .tabs {
    border-color: var(--color-border-dark);
  }
  
  .tab {
    padding: 0.75rem 1rem;
    background: none;
    border: none;
    color: var(--color-text-muted-light);
    cursor: pointer;
    white-space: nowrap;
    border-bottom: 2px solid transparent;
    transition: var(--transition-normal);
  }
  
  :global(.dark) .tab {
    color: var(--color-text-muted-dark);
  }
  
  .tab:hover {
    color: var(--color-primary);
    background-color: rgba(0, 0, 0, 0.02);
  }
  
  :global(.dark) .tab:hover {
    background-color: rgba(255, 255, 255, 0.02);
  }
  
  .tab.active {
    color: var(--color-primary);
    border-bottom-color: var(--color-primary);
    font-weight: 500;
  }
  
  .help-content {
    padding: 1rem;
    overflow-y: auto;
    flex: 1;
    color: var(--color-text-light);
  }
  
  :global(.dark) .help-content {
    color: var(--color-text-dark);
  }
  
  section h3 {
    margin-top: 0;
    margin-bottom: 1rem;
    font-size: 1.1rem;
    font-weight: 600;
  }
  
  /* 快捷键表格样式 */
  .shortcuts-table {
    width: 100%;
    border-collapse: collapse;
  }
  
  .shortcuts-table th,
  .shortcuts-table td {
    padding: 0.5rem;
    border: 1px solid var(--color-border-light);
    text-align: left;
  }
  
  :global(.dark) .shortcuts-table th,
  :global(.dark) .shortcuts-table td {
    border-color: var(--color-border-dark);
  }
  
  .shortcuts-table th {
    background-color: var(--color-bg-code-light);
    font-weight: 600;
  }
  
  :global(.dark) .shortcuts-table th {
    background-color: var(--color-bg-code-dark);
  }
  
  kbd {
    font-family: var(--font-mono);
    background-color: var(--color-bg-code-light);
    border: 1px solid var(--color-border-light);
    border-radius: var(--radius-sm);
    padding: 0.1rem 0.3rem;
    box-shadow: 0 1px 1px rgba(0, 0, 0, 0.2);
    font-size: 0.85em;
  }
  
  :global(.dark) kbd {
    background-color: var(--color-bg-code-dark);
    border-color: var(--color-border-dark);
    box-shadow: 0 1px 1px rgba(0, 0, 0, 0.4);
  }
  
  /* 语法示例网格 */
  .syntax-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1rem;
  }
  
  .syntax-item {
    border: 1px solid var(--color-border-light);
    border-radius: var(--radius);
    overflow: hidden;
  }
  
  :global(.dark) .syntax-item {
    border-color: var(--color-border-dark);
  }
  
  .syntax-item h4 {
    margin: 0;
    padding: 0.5rem;
    background-color: var(--color-bg-code-light);
    font-size: 0.9rem;
    font-weight: 600;
    border-bottom: 1px solid var(--color-border-light);
  }
  
  :global(.dark) .syntax-item h4 {
    background-color: var(--color-bg-code-dark);
    border-color: var(--color-border-dark);
  }
  
  .syntax-item pre {
    margin: 0;
    padding: 0.75rem;
    overflow-x: auto;
    font-family: var(--font-mono);
    font-size: 0.9rem;
    line-height: 1.4;
  }
  
  /* 关于部分 */
  .about-section {
    max-width: 600px;
    margin: 0 auto;
  }
  
  .about-section p {
    line-height: 1.6;
    margin-bottom: 1rem;
  }
  
  .about-section ul {
    padding-left: 1.5rem;
    margin-bottom: 1.5rem;
  }
  
  .about-section ul li {
    margin-bottom: 0.5rem;
  }
  
  .version, .copyright {
    font-size: 0.9rem;
    color: var(--color-text-muted-light);
    margin-top: 2rem;
    margin-bottom: 0.25rem;
  }
  
  :global(.dark) .version, 
  :global(.dark) .copyright {
    color: var(--color-text-muted-dark);
  }
  
  /* 响应式适配 */
  @media (max-width: 600px) {
    .help-dialog {
      width: 95%;
      max-height: 90vh;
    }
    
    .syntax-grid {
      grid-template-columns: 1fr;
    }
    
    .tabs {
      flex-wrap: wrap;
    }
    
    .tab {
      flex: 1 0 auto;
      text-align: center;
      padding: 0.5rem 0.75rem;
    }
  }
</style> 