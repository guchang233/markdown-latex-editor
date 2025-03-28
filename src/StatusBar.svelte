<script>
  export let wordCount = 0;
  export let charCount = 0;
  export let currentLatexError = null;
  export let isSaved = true;
  export let currentFileName = 'untitled.md';
  
  // 格式化错误消息
  $: formattedError = currentLatexError ? 
    (currentLatexError.length > 50 ? 
      currentLatexError.substring(0, 50) + '...' : 
      currentLatexError) : 
    null;
</script>

<div class="status-bar">
  <div class="status-item file-info">
    <span class="file-name">{currentFileName}</span>
    <span class="save-status">{isSaved ? '已保存' : '未保存'}</span>
  </div>
  
  {#if currentLatexError}
    <div class="status-item latex-error">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
      <span title={currentLatexError}>LaTeX 错误: {formattedError}</span>
    </div>
  {/if}
  
  <div class="status-item count-info">
    <span class="word-count">{wordCount} 字</span>
    <span class="char-count">{charCount} 字符</span>
  </div>
</div>

<style>
  .status-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 1rem;
    background-color: var(--color-bg-code-light);
    border-top: 1px solid var(--color-border-light);
    font-size: 12px;
    color: var(--color-text-muted-light);
  }
  
  :global(.dark) .status-bar {
    background-color: var(--color-bg-code-dark);
    border-color: var(--color-border-dark);
    color: var(--color-text-muted-dark);
  }
  
  .status-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .file-info {
    flex: 1;
  }
  
  .file-name {
    font-weight: 500;
  }
  
  .save-status {
    background-color: var(--color-success);
    color: white;
    padding: 2px 6px;
    border-radius: 10px;
    font-size: 10px;
    font-weight: 500;
  }
  
  .save-status:not(:empty) {
    margin-left: 8px;
  }
  
  :global(.dark) .save-status {
    opacity: 0.9;
  }
  
  /* 未保存样式 */
  .save-status:contains('未保存') {
    background-color: var(--color-warning);
  }
  
  .latex-error {
    color: var(--color-error);
    background-color: rgba(239, 68, 68, 0.1);
    padding: 0.25rem 0.5rem;
    border-radius: var(--radius);
    max-width: 300px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  :global(.dark) .latex-error {
    background-color: rgba(239, 68, 68, 0.2);
  }
  
  .latex-error svg {
    color: var(--color-error);
  }
  
  .count-info {
    display: flex;
    gap: 1rem;
  }
</style> 