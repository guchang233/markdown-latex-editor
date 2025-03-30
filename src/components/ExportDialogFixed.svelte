<script lang="ts">
  import { createEventDispatcher, onMount, afterUpdate } from 'svelte';
  
  // 导出设置
  export let isOpen = false;
  
  // 导出选项
  let exportFormat = 'markdown'; // markdown, html, pdf
  let includeStyles = true;
  let filename = 'document';
  let includeToc = false; // 目录选项
  let paperSize = 'a4'; // a4, letter, legal
  let codeTheme = 'default'; // default, github, monokai
  
  // 创建事件分发器
  const dispatch = createEventDispatcher();
  
  // 跟踪对话框打开/关闭状态的变更
  afterUpdate(() => {
    console.log('ExportDialog update, isOpen =', isOpen);
  });
  
  // 确保初始状态为关闭
  onMount(() => {
    console.log('ExportDialog mounted with isOpen =', isOpen);
    
    // 强制确保对话框在初始化时是关闭的
    isOpen = false;
    
    // 额外的安全检查 - 使用延迟确保对话框在页面加载时不会意外打开
    setTimeout(() => {
      if (isOpen) {
        console.log('Forcing dialog to close during mount');
        isOpen = false;
      }
    }, 200);
  });
  
  // 关闭对话框
  function closeDialog() {
    console.log('关闭导出对话框');
    isOpen = false;
  }
  
  // 导出文档
  function exportDocument() {
    console.log('执行导出操作');
    dispatch('export', {
      format: exportFormat,
      includeStyles,
      filename,
      includeToc,
      paperSize,
      codeTheme
    });
    closeDialog();
  }
  
  // 按Escape键关闭对话框
  function handleKeydown(event) {
    if (event.key === 'Escape' && isOpen) {
      closeDialog();
    }
  }
</script>

<svelte:window on:keydown={handleKeydown}/>

<!-- 只在isOpen为true时渲染对话框内容，完全避免隐藏元素的问题 -->
{#if isOpen}
  <div class="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center" on:click|self={closeDialog}>
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-8 max-h-[90vh] overflow-y-auto">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-bold text-gray-900 dark:text-white">导出设置</h2>
        <button 
          class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" 
          on:click={closeDialog}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      
      <div class="space-y-5">
        <!-- 导出格式 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            导出格式
          </label>
          <div class="grid grid-cols-3 gap-3">
            <button 
              class={`py-2 px-4 rounded-md border ${exportFormat === 'markdown' ? 'bg-blue-100 border-blue-500 dark:bg-blue-900 dark:border-blue-400 font-medium' : 'border-gray-300 dark:border-gray-600'} transition-colors`}
              on:click={() => exportFormat = 'markdown'}
            >
              Markdown
            </button>
            <button 
              class={`py-2 px-4 rounded-md border ${exportFormat === 'html' ? 'bg-blue-100 border-blue-500 dark:bg-blue-900 dark:border-blue-400 font-medium' : 'border-gray-300 dark:border-gray-600'} transition-colors`}
              on:click={() => exportFormat = 'html'}
            >
              HTML
            </button>
            <button 
              class={`py-2 px-4 rounded-md border ${exportFormat === 'pdf' ? 'bg-blue-100 border-blue-500 dark:bg-blue-900 dark:border-blue-400 font-medium' : 'border-gray-300 dark:border-gray-600'} transition-colors`}
              on:click={() => exportFormat = 'pdf'}
            >
              PDF
            </button>
          </div>
        </div>
        
        <!-- 文件名 -->
        <div>
          <label for="filename" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            文件名
          </label>
          <input 
            type="text" 
            id="filename" 
            bind:value={filename} 
            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
        
        <!-- 选项容器 -->
        <div class="space-y-3 py-2">
          <!-- 包含样式 -->
          <div class="flex items-center">
            <input 
              type="checkbox" 
              id="includeStyles" 
              bind:checked={includeStyles} 
              class="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
            />
            <label for="includeStyles" class="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              包含样式
            </label>
          </div>
          
          <!-- 包含目录 -->
          <div class="flex items-center">
            <input 
              type="checkbox" 
              id="includeToc" 
              bind:checked={includeToc} 
              class="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
            />
            <label for="includeToc" class="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              包含目录
            </label>
          </div>
        </div>
        
        {#if exportFormat === 'pdf'}
          <!-- 页面大小 -->
          <div>
            <label for="paperSize" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              页面大小
            </label>
            <select 
              id="paperSize" 
              bind:value={paperSize} 
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="a4">A4</option>
              <option value="letter">信纸 (Letter)</option>
              <option value="legal">法律页面 (Legal)</option>
            </select>
          </div>
        {/if}
        
        {#if exportFormat === 'html' || exportFormat === 'pdf'}
          <!-- 代码主题 -->
          <div>
            <label for="codeTheme" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              代码主题
            </label>
            <select 
              id="codeTheme" 
              bind:value={codeTheme} 
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="default">默认</option>
              <option value="github">GitHub</option>
              <option value="monokai">Monokai</option>
            </select>
          </div>
        {/if}
      </div>
      
      <div class="mt-8 flex justify-end">
        <button 
          class="mr-3 px-5 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none transition-colors"
          on:click={closeDialog}
        >
          取消
        </button>
        <button 
          class="px-5 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none transition-colors"
          on:click={exportDocument}
        >
          导出
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  /* 对话框动画 */
  .fixed {
    animation: fadeIn 0.25s ease-out;
  }
  
  @keyframes fadeIn {
    from { opacity: 0; transform: scale(0.98); }
    to { opacity: 1; transform: scale(1); }
  }
</style> 