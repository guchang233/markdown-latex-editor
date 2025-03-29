<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  
  // 导出设置
  export let isOpen = false;
  
  // 导出选项
  let exportFormat = 'markdown'; // markdown, html, pdf
  let includeStyles = true;
  let filename = 'document';
  let includeToc = false; // 目录选项
  let pageSize = 'a4'; // a4, letter, legal
  let codeTheme = 'default'; // default, github, monokai
  
  // 创建事件分发器
  const dispatch = createEventDispatcher();
  
  // 确保初始状态为关闭
  onMount(() => {
    console.log('ExportDialog mounted, dialog state:', isOpen);
    isOpen = false;
  });
  
  // 关闭对话框
  function closeDialog() {
    console.log('Closing export dialog');
    isOpen = false;
  }
  
  // 导出文档
  function exportDocument() {
    dispatch('export', {
      format: exportFormat,
      includeStyles,
      filename,
      includeToc,
      pageSize,
      codeTheme
    });
    closeDialog();
  }
</script>

<div class={`fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center ${isOpen ? '' : 'hidden'}`}>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-bold text-gray-900 dark:text-white">导出设置</h2>
      <button 
        class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" 
        on:click={closeDialog}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
    
    <div class="space-y-4">
      <!-- 导出格式 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          导出格式
        </label>
        <div class="grid grid-cols-3 gap-2">
          <button 
            class={`py-2 px-4 rounded-md border ${exportFormat === 'markdown' ? 'bg-blue-100 border-blue-500 dark:bg-blue-900 dark:border-blue-400' : 'border-gray-300 dark:border-gray-600'}`}
            on:click={() => exportFormat = 'markdown'}
          >
            Markdown
          </button>
          <button 
            class={`py-2 px-4 rounded-md border ${exportFormat === 'html' ? 'bg-blue-100 border-blue-500 dark:bg-blue-900 dark:border-blue-400' : 'border-gray-300 dark:border-gray-600'}`}
            on:click={() => exportFormat = 'html'}
          >
            HTML
          </button>
          <button 
            class={`py-2 px-4 rounded-md border ${exportFormat === 'pdf' ? 'bg-blue-100 border-blue-500 dark:bg-blue-900 dark:border-blue-400' : 'border-gray-300 dark:border-gray-600'}`}
            on:click={() => exportFormat = 'pdf'}
          >
            PDF
          </button>
        </div>
      </div>
      
      <!-- 文件名 -->
      <div>
        <label for="filename" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          文件名
        </label>
        <input 
          type="text" 
          id="filename" 
          bind:value={filename} 
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
        />
      </div>
      
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
      
      {#if exportFormat === 'pdf'}
        <!-- 页面大小 -->
        <div>
          <label for="pageSize" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            页面大小
          </label>
          <select 
            id="pageSize" 
            bind:value={pageSize} 
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
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
          <label for="codeTheme" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            代码主题
          </label>
          <select 
            id="codeTheme" 
            bind:value={codeTheme} 
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="default">默认</option>
            <option value="github">GitHub</option>
            <option value="monokai">Monokai</option>
          </select>
        </div>
      {/if}
    </div>
    
    <div class="mt-6 flex justify-end">
      <button 
        class="mr-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none"
        on:click={closeDialog}
      >
        取消
      </button>
      <button 
        class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
        on:click={exportDocument}
      >
        导出
      </button>
    </div>
  </div>
</div>

<style>
  /* 对话框动画 */
  div:not(.hidden) {
    animation: fadeIn 0.2s ease-out;
  }
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
</style> 