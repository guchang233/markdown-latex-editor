<script lang="ts">
  import { themeStore } from '../stores/theme';
  import { onMount } from 'svelte';
  
  // Document state tracking
  let documentState: 'saved' | 'saving' | 'unsaved' = 'saved';
  
  // Export the current document
  function exportDocument() {
    console.log('Header: Export button clicked');
    const event = new CustomEvent('export-document');
    window.dispatchEvent(event);
  }
  
  onMount(() => {
    console.log('Header component mounted');
  });
</script>

<header class="w-full bg-base-100 dark:bg-base-100-dark shadow-sm border-b border-base-300 dark:border-base-300-dark flex-shrink-0">
  <div class="w-full px-4 py-2 flex items-center justify-between">
    <!-- Logo and title -->
    <div class="flex items-center gap-3">
      <div class="font-bold text-xl text-primary dark:text-primary-dark">MarkTeX</div>
      <div class="text-sm text-neutral/60 dark:text-neutral-dark/60">Editor</div>
    </div>
    
    <!-- Status indicator -->
    <div class="flex items-center gap-2">
      <div class="hidden md:flex items-center gap-1 text-sm">
        <span>Status:</span>
        {#if documentState === 'saved'}
          <span class="text-accent dark:text-accent-dark">Saved</span>
        {:else if documentState === 'saving'}
          <span class="text-primary dark:text-primary-dark">Saving...</span>
        {:else}
          <span class="text-red-500">Unsaved</span>
        {/if}
      </div>
    </div>
    
    <!-- Actions menu -->
    <div class="flex items-center gap-3">
      <button 
        class="btn-secondary text-sm flex items-center gap-1"
        on:click={exportDocument}
        title="Export Markdown"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        <span class="hidden md:inline">Export</span>
      </button>
    </div>
  </div>
</header> 