<script>
  import { onMount } from 'svelte';
  
  let darkMode = false;
  
  function toggleTheme() {
    darkMode = !darkMode;
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }
  
  onMount(() => {
    // 初始化主题设置
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      darkMode = true;
      document.documentElement.classList.add('dark');
    }
  });
</script>

<button 
  class="theme-toggle" 
  on:click={toggleTheme} 
  aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}>
  {#if darkMode}
    <!-- Sun icon for light mode -->
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="5"></circle>
      <line x1="12" y1="1" x2="12" y2="3"></line>
      <line x1="12" y1="21" x2="12" y2="23"></line>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
      <line x1="1" y1="12" x2="3" y2="12"></line>
      <line x1="21" y1="12" x2="23" y2="12"></line>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
    </svg>
  {:else}
    <!-- Moon icon for dark mode -->
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
    </svg>
  {/if}
</button>

<style>
  .theme-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: transparent;
    color: var(--color-text-muted-light);
    border: 1px solid var(--color-border-light);
    cursor: pointer;
    transition: var(--transition-normal);
  }
  
  :global(.dark) .theme-toggle {
    color: var(--color-text-muted-dark);
    border-color: var(--color-border-dark);
  }
  
  .theme-toggle:hover {
    background-color: rgba(0, 0, 0, 0.05);
    color: var(--color-primary);
  }
  
  :global(.dark) .theme-toggle:hover {
    background-color: rgba(255, 255, 255, 0.05);
    color: var(--color-primary-light);
  }
</style> 