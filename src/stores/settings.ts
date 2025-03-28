import { writable } from 'svelte/store';

// 定义设置接口
interface EditorSettings {
  // 主题设置
  fontSize: number;       // 编辑器字体大小
  lineHeight: number;     // 行高
  tabSize: number;        // 制表符大小
  showLineNumbers: boolean; // 显示行号
  
  // 自动保存设置
  autoSave: boolean;      // 启用自动保存
  autoSaveInterval: number; // 自动保存间隔（秒）
  
  // 预览设置
  syncScroll: boolean;    // 同步滚动
  livePreview: boolean;   // 实时预览
  showCodeBackground: boolean; // 显示代码块背景
  showMathBackground: boolean; // 显示数学公式背景
  
  // 快捷键设置
  shortcutsEnabled: boolean; // 启用快捷键
}

// 默认设置
const defaultSettings: EditorSettings = {
  fontSize: 14,
  lineHeight: 1.6,
  tabSize: 2,
  showLineNumbers: true,
  
  autoSave: true,
  autoSaveInterval: 30,
  
  syncScroll: true,
  livePreview: true,
  showCodeBackground: true,  // 默认显示代码块背景
  showMathBackground: false, // 默认不显示数学公式背景
  
  shortcutsEnabled: true
};

// 从本地存储加载设置
function loadSettings(): EditorSettings {
  try {
    const savedSettings = localStorage.getItem('marktex-settings');
    if (savedSettings) {
      return { ...defaultSettings, ...JSON.parse(savedSettings) };
    }
  } catch (error) {
    console.error('无法加载设置:', error);
  }
  return defaultSettings;
}

// 创建设置存储
const settingsStore = writable<EditorSettings>(loadSettings());

// 保存设置到本地存储
settingsStore.subscribe(settings => {
  try {
    localStorage.setItem('marktex-settings', JSON.stringify(settings));
  } catch (error) {
    console.error('无法保存设置:', error);
  }
});

// 重置设置为默认值
function resetSettings() {
  settingsStore.set({ ...defaultSettings });
}

// 更新单个设置项
function updateSetting<K extends keyof EditorSettings>(key: K, value: EditorSettings[K]) {
  settingsStore.update(settings => {
    return { ...settings, [key]: value };
  });
}

export { settingsStore, resetSettings, updateSetting }; 