<script lang="ts">
  // Get the current year
  const currentYear = new Date().getFullYear();
</script>

<footer class="w-full bg-base-100 dark:bg-base-100-dark shadow-inner border-t border-base-300 dark:border-base-300-dark mt-auto flex-shrink-0">
  <div class="w-full px-4 py-2">
    <div class="flex flex-col md:flex-row justify-between items-center gap-2">
      <div class="text-sm text-neutral/60 dark:text-neutral-dark/60">
        © {currentYear} MarkTeX Editor
      </div>
      <div class="text-xs text-neutral/40 dark:text-neutral-dark/40">
        <div class="flex items-center gap-2">
          <span>Powered by</span>
          <a href="https://svelte.dev" target="_blank" rel="noopener" class="hover:text-primary dark:hover:text-primary-dark transition-colors">Svelte</a>
          <span>•</span>
          <a href="https://codemirror.net" target="_blank" rel="noopener" class="hover:text-primary dark:hover:text-primary-dark transition-colors">CodeMirror</a>
          <span>•</span>
          <a href="https://katex.org" target="_blank" rel="noopener" class="hover:text-primary dark:hover:text-primary-dark transition-colors">KaTeX</a>
        </div>
      </div>
    </div>
  </div>
</footer> 