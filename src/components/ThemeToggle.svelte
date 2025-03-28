<script lang="ts">
  import { themeStore } from '../stores/theme';
  
  function toggleTheme() {
    themeStore.toggleTheme();
  }
</script>

<button 
  on:click={toggleTheme}
  class="w-12 h-12 rounded-full bg-base-100 dark:bg-base-100-dark shadow-md flex items-center justify-center hover:shadow-lg transition-all duration-200"
  title={$themeStore.theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'} 
  aria-label={$themeStore.theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
>
  {#if $themeStore.theme === 'light'}
    <!-- Moon icon for dark mode -->
    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-neutral" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
  {:else}
    <!-- Sun icon for light mode -->
    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-neutral-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  {/if}
</button> 