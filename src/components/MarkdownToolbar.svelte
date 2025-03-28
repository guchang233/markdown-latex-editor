<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  
  export let editorReady: boolean = false; // 新添加：接收编辑器就绪状态
  
  const dispatch = createEventDispatcher();
  
  // 监控 editorReady 状态变化
  $: {
    console.log('[MarkdownToolbar] editorReady changed to:', editorReady);
  }
  
  onMount(() => {
    console.log('[MarkdownToolbar] 组件挂载完成, editorReady =', editorReady);
  });
  
  // Toolbar actions
  const toolbarItems = [
    { id: 'bold', tooltip: 'Bold (Ctrl+B)', placeholder: '**Bold**', icon: 'bold' },
    { id: 'italic', tooltip: 'Italic (Ctrl+I)', placeholder: '*Italic*', icon: 'italic' },
    { id: 'strikethrough', tooltip: 'Strikethrough', placeholder: '~~Strikethrough~~', icon: 'strikethrough' },
    { id: 'code', tooltip: 'Code (Ctrl+K)', placeholder: '`Code`', icon: 'code' },
    { id: 'link', tooltip: 'Link', placeholder: '[Link](https://example.com)', icon: 'link' },
    { id: 'image', tooltip: 'Image', placeholder: '![Alt text](https://example.com/image.jpg)', icon: 'image' },
    { id: 'table', tooltip: 'Table', placeholder: '| Header | Header |\n| ------ | ------ |\n| Cell   | Cell   |', icon: 'table' },
    { id: 'formula', tooltip: 'Math Formula', placeholder: '$E = mc^2$', icon: 'function' },
    { id: 'bulletList', tooltip: 'Bulleted List', placeholder: '- List item\n- Another item', icon: 'list' },
    { id: 'numberedList', tooltip: 'Numbered List', placeholder: '1. First item\n2. Second item', icon: 'list-ordered' },
    { id: 'taskList', tooltip: 'Task List', placeholder: '- [ ] Todo item\n- [x] Completed item', icon: 'check-square' },
    { id: 'heading', tooltip: 'Heading', placeholder: '## Heading', icon: 'heading' }
  ];
  
  function handleAction(action: string, placeholder: string) {
    if (!editorReady) {
      console.log('[MarkdownToolbar] 编辑器未就绪，忽略操作:', action);
      // 额外安全措施：在UI中显示警告
      const notificationContainer = document.querySelector('.notification-container') || createNotificationContainer();
      showNotification(notificationContainer, '编辑器尚未完全加载，请稍候再试', 'warning');
      return;
    }
    
    console.log('[MarkdownToolbar] 按钮点击:', action);
    dispatch('action', { action, placeholder });
  }

  // 创建通知容器
  function createNotificationContainer() {
    const container = document.createElement('div');
    container.className = 'notification-container fixed top-4 right-4 z-50 flex flex-col gap-2';
    document.body.appendChild(container);
    return container;
  }

  // 显示通知
  function showNotification(container: HTMLElement, message: string, type: 'info' | 'warning' | 'error' = 'info') {
    const notification = document.createElement('div');
    const backgroundColor = type === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900' : 
                           type === 'error' ? 'bg-red-100 dark:bg-red-900' : 
                           'bg-blue-100 dark:bg-blue-900';
    const textColor = type === 'warning' ? 'text-yellow-800 dark:text-yellow-200' : 
                       type === 'error' ? 'text-red-800 dark:text-red-200' : 
                       'text-blue-800 dark:text-blue-200';
    
    notification.className = `${backgroundColor} ${textColor} px-4 py-2 rounded-lg shadow-md text-sm max-w-xs animate-fade-in`;
    notification.innerHTML = message;
    container.appendChild(notification);
    
    // 3秒后自动移除
    setTimeout(() => {
      notification.classList.add('animate-fade-out');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  // 获取图标SVG
  function getIconSvg(icon: string) {
    switch(icon) {
      case 'bold':
        return '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path></svg>';
      case 'italic':
        return '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="4" x2="10" y2="4"></line><line x1="14" y1="20" x2="5" y2="20"></line><line x1="15" y1="4" x2="9" y2="20"></line></svg>';
      case 'strikethrough':
        return '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.3 5H6.7a2.7 2.7 0 0 0-2.7 2.7v8.6a2.7 2.7 0 0 0 2.7 2.7h10.6a2.7 2.7 0 0 0 2.7-2.7V7.7A2.7 2.7 0 0 0 17.3 5z"/><line x1="4" y1="12" x2="20" y2="12"/></svg>';
      case 'code':
        return '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>';
      case 'link':
        return '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>';
      case 'image':
        return '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>';
      case 'table':
        return '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3h18v18H3zM3 9h18M3 15h18M9 3v18M15 3v18"></path></svg>';
      case 'function':
        return '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 9h14M5 15h14M9 5v14M15 5v14"/></svg>';
      case 'list':
        return '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>';
      case 'list-ordered':
        return '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="10" y1="6" x2="21" y2="6"></line><line x1="10" y1="12" x2="21" y2="12"></line><line x1="10" y1="18" x2="21" y2="18"></line><path d="M4 6h1v4"></path><path d="M4 10h2"></path><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"></path></svg>';
      case 'check-square':
        return '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>';
      case 'heading':
        return '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 12h12"></path><path d="M6 20V4"></path><path d="M18 20V4"></path></svg>';
      default:
        return '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle></svg>';
    }
  }
</script>

<div class="flex items-center gap-2 p-2 bg-base-200 dark:bg-base-200-dark rounded-lg shadow-sm overflow-x-auto">
  {#if !editorReady}
    <div class="editor-loading-indicator toolbar-status py-1 px-3 text-sm flex items-center gap-1 mr-2">
      <div class="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
      <span>编辑器加载中...</span>
    </div>
  {:else}
    <div class="editor-ready-indicator toolbar-status py-1 px-3 text-sm flex items-center gap-1 mr-2">
      <div class="w-3 h-3 rounded-full bg-green-500"></div>
      <span>编辑器就绪</span>
    </div>
  {/if}
  
  {#each toolbarItems as action}
    <button 
      type="button" 
      class="toolbar-button p-2 hover:bg-base-300 dark:hover:bg-base-300-dark rounded-md transition-colors duration-150"
      class:disabled={!editorReady}
      title={editorReady ? action.tooltip : "编辑器加载中..."}
      on:click={() => handleAction(action.id, action.placeholder)}
      disabled={!editorReady}
    >
      <span class="flex items-center justify-center w-5 h-5" aria-hidden="true">
        <!-- 使用HTML嵌入SVG图标 -->
        {@html getIconSvg(action.icon)}
      </span>
    </button>
  {/each}
</div>

<style>
  /* 确保图标居中并提高可点击性 */
  .toolbar-button {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 40px;
    min-height: 40px;
    cursor: pointer;
    position: relative;
    overflow: visible;
    z-index: 1;
    border: 1px solid transparent;
    transition: all 0.2s ease;
    user-select: none;
    -webkit-user-select: none;
    touch-action: manipulation;
  }
  
  .toolbar-button:focus {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }
  
  .toolbar-button:hover {
    transform: translateY(-1px);
    box-shadow: var(--shadow-sm);
    background-color: rgba(0, 0, 0, 0.05);
    color: var(--color-primary);
  }
  
  :global(.dark) .toolbar-button:hover {
    background-color: rgba(255, 255, 255, 0.05);
    color: var(--color-primary-light);
  }
  
  .toolbar-button:active {
    transform: translateY(0);
    box-shadow: none;
    background-color: rgba(0, 0, 0, 0.1) !important;
  }
  
  :global(.dark) .toolbar-button:active {
    background-color: rgba(255, 255, 255, 0.1) !important;
  }
  
  /* 禁用状态 */
  .toolbar-button.disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }
  
  /* 确保SVG图标可见 */
  :global(.toolbar-button svg) {
    pointer-events: none; /* 防止SVG拦截点击事件 */
    display: block; /* 确保SVG显示 */
    stroke: currentColor; /* 确保颜色继承 */
    stroke-width: 2px; /* 加粗线条 */
  }
  
  /* 添加个按钮间隔，防止误点 */
  .toolbar-button + .toolbar-button {
    margin-left: 2px;
  }
  
  /* 状态指示器样式 */
  .toolbar-status {
    background-color: rgba(0, 0, 0, 0.05);
    border-radius: var(--radius);
    color: var(--color-text-muted-light);
    font-size: 12px;
    white-space: nowrap;
  }
  
  :global(.dark) .toolbar-status {
    background-color: rgba(255, 255, 255, 0.05);
    color: var(--color-text-muted-dark);
  }
  
  /* 加载状态动画 */
  @keyframes pulse {
    0% { opacity: 0.5; }
    50% { opacity: 1; }
    100% { opacity: 0.5; }
  }
  
  .animate-pulse {
    animation: pulse 1.5s ease-in-out infinite;
  }
  
  /* 通知动画 */
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes fadeOut {
    from { opacity: 1; transform: translateY(0); }
    to { opacity: 0; transform: translateY(-10px); }
  }
  
  :global(.animate-fade-in) {
    animation: fadeIn 0.3s ease forwards;
  }
  
  :global(.animate-fade-out) {
    animation: fadeOut 0.3s ease forwards;
  }
  
  /* 增强禁用状态的视觉反馈 */
  .toolbar-button.disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
    position: relative;
  }
  
  /* 禁用状态悬停时的提示 */
  .toolbar-button.disabled:hover::after {
    content: '编辑器加载中...';
    position: absolute;
    bottom: -30px;
    left: 50%;
    transform: translateX(-50%);
    background-color: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    white-space: nowrap;
    z-index: 10;
  }
</style> 