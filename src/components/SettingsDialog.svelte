<script lang="ts">
  import { settingsStore, resetSettings, updateSetting } from '../stores/settings';
  
  // 是否显示设置对话框
  export let isOpen = false;
  
  // 关闭设置对话框
  function closeSettings() {
    isOpen = false;
  }
  
  // 切换布尔值设置
  function toggleSetting(key: any) {
    updateSetting(key, !$settingsStore[key]);
  }
  
  // 更新数值设置
  function updateNumberSetting(key: any, value: string) {
    updateSetting(key, parseInt(value, 10));
  }
  
  // 重置所有设置
  function handleResetSettings() {
    resetSettings();
  }
  
  // 标签页
  let activeTab = 'appearance';
  
  function setActiveTab(tab: string) {
    activeTab = tab;
  }
</script>

{#if isOpen}
  <div class="settings-dialog-overlay" on:click={closeSettings}></div>
  
  <div class="settings-dialog">
    <header class="settings-dialog-header">
      <h2>编辑器设置</h2>
      <button class="close-button" on:click={closeSettings} aria-label="关闭设置">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </header>
    
    <div class="tabs">
      <button 
        class="tab" 
        class:active={activeTab === 'appearance'} 
        on:click={() => setActiveTab('appearance')}>
        外观
      </button>
      <button 
        class="tab" 
        class:active={activeTab === 'editor'} 
        on:click={() => setActiveTab('editor')}>
        编辑器
      </button>
      <button 
        class="tab" 
        class:active={activeTab === 'autosave'} 
        on:click={() => setActiveTab('autosave')}>
        自动保存
      </button>
      <button 
        class="tab" 
        class:active={activeTab === 'preview'} 
        on:click={() => setActiveTab('preview')}>
        预览
      </button>
    </div>
    
    <div class="settings-content">
      {#if activeTab === 'appearance'}
        <section class="settings-section">
          <h3>外观设置</h3>
          
          <div class="setting-item">
            <label for="fontSize">字体大小</label>
            <div class="setting-control">
              <input 
                type="range" 
                id="fontSize" 
                min="10" 
                max="24" 
                step="1" 
                value={$settingsStore.fontSize} 
                on:input={(e) => updateNumberSetting('fontSize', e.target.value)} 
              />
              <span class="value-display">{$settingsStore.fontSize}px</span>
            </div>
          </div>
          
          <div class="setting-item">
            <label for="lineHeight">行高</label>
            <div class="setting-control">
              <input 
                type="range" 
                id="lineHeight" 
                min="1" 
                max="3" 
                step="0.1" 
                value={$settingsStore.lineHeight} 
                on:input={(e) => updateNumberSetting('lineHeight', e.target.value)} 
              />
              <span class="value-display">{$settingsStore.lineHeight}</span>
            </div>
          </div>
          
          <div class="setting-item checkbox">
            <label for="showLineNumbers">
              <input 
                type="checkbox" 
                id="showLineNumbers" 
                checked={$settingsStore.showLineNumbers} 
                on:change={() => toggleSetting('showLineNumbers')} 
              />
              <span>显示行号</span>
            </label>
          </div>
        </section>
      {:else if activeTab === 'editor'}
        <section class="settings-section">
          <h3>编辑器设置</h3>
          
          <div class="setting-item">
            <label for="tabSize">制表符大小</label>
            <div class="setting-control">
              <input 
                type="range" 
                id="tabSize" 
                min="2" 
                max="8" 
                step="2" 
                value={$settingsStore.tabSize} 
                on:input={(e) => updateNumberSetting('tabSize', e.target.value)} 
              />
              <span class="value-display">{$settingsStore.tabSize} 个空格</span>
            </div>
          </div>
          
          <div class="setting-item checkbox">
            <label for="shortcutsEnabled">
              <input 
                type="checkbox" 
                id="shortcutsEnabled" 
                checked={$settingsStore.shortcutsEnabled} 
                on:change={() => toggleSetting('shortcutsEnabled')} 
              />
              <span>启用快捷键</span>
            </label>
          </div>
        </section>
      {:else if activeTab === 'autosave'}
        <section class="settings-section">
          <h3>自动保存设置</h3>
          
          <div class="setting-item checkbox">
            <label for="autoSave">
              <input 
                type="checkbox" 
                id="autoSave" 
                checked={$settingsStore.autoSave} 
                on:change={() => toggleSetting('autoSave')} 
              />
              <span>启用自动保存</span>
            </label>
          </div>
          
          <div class="setting-item">
            <label for="autoSaveInterval">自动保存间隔（秒）</label>
            <div class="setting-control">
              <input 
                type="range" 
                id="autoSaveInterval" 
                min="5" 
                max="300" 
                step="5" 
                value={$settingsStore.autoSaveInterval} 
                on:input={(e) => updateNumberSetting('autoSaveInterval', e.target.value)} 
                disabled={!$settingsStore.autoSave}
              />
              <span class="value-display">{$settingsStore.autoSaveInterval} 秒</span>
            </div>
          </div>
        </section>
      {:else if activeTab === 'preview'}
        <section class="settings-section">
          <h3>预览设置</h3>
          
          <div class="setting-item checkbox">
            <label for="syncScroll">
              <input 
                type="checkbox" 
                id="syncScroll" 
                checked={$settingsStore.syncScroll} 
                on:change={() => toggleSetting('syncScroll')} 
              />
              <span>同步滚动</span>
            </label>
          </div>
          
          <div class="setting-item checkbox">
            <label for="livePreview">
              <input 
                type="checkbox" 
                id="livePreview" 
                checked={$settingsStore.livePreview} 
                on:change={() => toggleSetting('livePreview')} 
              />
              <span>实时预览</span>
            </label>
          </div>
          
          <div class="setting-item checkbox">
            <label for="showCodeBackground">
              <input 
                type="checkbox" 
                id="showCodeBackground" 
                checked={$settingsStore.showCodeBackground} 
                on:change={() => toggleSetting('showCodeBackground')} 
              />
              <span>显示代码块背景</span>
            </label>
          </div>
          
          <div class="setting-item checkbox">
            <label for="showMathBackground">
              <input 
                type="checkbox" 
                id="showMathBackground" 
                checked={$settingsStore.showMathBackground} 
                on:change={() => toggleSetting('showMathBackground')} 
              />
              <span>显示公式块背景</span>
            </label>
          </div>
        </section>
      {/if}
    </div>
    
    <div class="settings-actions">
      <button class="reset-button" on:click={handleResetSettings}>重置为默认值</button>
      <button class="done-button" on:click={closeSettings}>完成</button>
    </div>
  </div>
{/if}

<style>
  .settings-dialog-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 1000;
  }
  
  .settings-dialog {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 90%;
    max-width: 600px;
    max-height: 80vh;
    background-color: var(--color-bg-light);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    z-index: 1001;
  }
  
  :global(.dark) .settings-dialog {
    background-color: var(--color-bg-dark);
  }
  
  .settings-dialog-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    border-bottom: 1px solid var(--color-border-light);
  }
  
  :global(.dark) .settings-dialog-header {
    border-color: var(--color-border-dark);
  }
  
  .settings-dialog-header h2 {
    margin: 0;
    font-size: 1.25rem;
    color: var(--color-text-light);
  }
  
  :global(.dark) .settings-dialog-header h2 {
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
  
  .settings-content {
    padding: 1rem;
    overflow-y: auto;
    flex: 1;
    color: var(--color-text-light);
  }
  
  :global(.dark) .settings-content {
    color: var(--color-text-dark);
  }
  
  .settings-section h3 {
    margin-top: 0;
    margin-bottom: 1.5rem;
    font-size: 1.1rem;
    font-weight: 600;
  }
  
  .setting-item {
    margin-bottom: 1.5rem;
  }
  
  .setting-item label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
  }
  
  .setting-control {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  
  .setting-control input[type="range"] {
    flex: 1;
    accent-color: var(--color-primary);
  }
  
  .value-display {
    min-width: 60px;
    text-align: right;
    font-family: var(--font-mono);
    font-size: 0.9rem;
    color: var(--color-text-muted-light);
  }
  
  :global(.dark) .value-display {
    color: var(--color-text-muted-dark);
  }
  
  .setting-item.checkbox label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    user-select: none;
  }
  
  .setting-item.checkbox input[type="checkbox"] {
    width: 18px;
    height: 18px;
    accent-color: var(--color-primary);
  }
  
  .settings-actions {
    display: flex;
    justify-content: space-between;
    padding: 1rem;
    border-top: 1px solid var(--color-border-light);
  }
  
  :global(.dark) .settings-actions {
    border-color: var(--color-border-dark);
  }
  
  .reset-button {
    padding: 0.5rem 1rem;
    background: none;
    border: 1px solid var(--color-border-light);
    border-radius: var(--radius);
    color: var(--color-text-muted-light);
    cursor: pointer;
    transition: var(--transition-normal);
  }
  
  :global(.dark) .reset-button {
    border-color: var(--color-border-dark);
    color: var(--color-text-muted-dark);
  }
  
  .reset-button:hover {
    background-color: rgba(0, 0, 0, 0.05);
    color: var(--color-error);
  }
  
  :global(.dark) .reset-button:hover {
    background-color: rgba(255, 255, 255, 0.05);
  }
  
  .done-button {
    padding: 0.5rem 1.5rem;
    background-color: var(--color-primary);
    border: none;
    border-radius: var(--radius);
    color: white;
    font-weight: 500;
    cursor: pointer;
    transition: var(--transition-normal);
  }
  
  .done-button:hover {
    background-color: var(--color-primary-dark);
  }
  
  /* 响应式适配 */
  @media (max-width: 600px) {
    .settings-dialog {
      width: 95%;
      max-height: 90vh;
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