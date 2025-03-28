/**
 * 键盘快捷键处理工具
 * 用于管理编辑器中的快捷键
 */

/**
 * 快捷键配置项类型
 * @typedef {Object} ShortcutConfig
 * @property {string} key - 快捷键字符串，如 "ctrl+s"
 * @property {(event: KeyboardEvent) => void} callback - 快捷键触发时执行的回调函数
 */

/**
 * 文本操作接口
 * @typedef {Object} TextActions
 * @property {(prefix: string, suffix: string) => void} format - 格式化文本
 * @property {(level: number) => void} heading - 添加标题
 * @property {() => void} link - 添加链接
 * @property {() => void} inlineMath - 添加内联公式
 * @property {() => void} blockMath - 添加块级公式
 * @property {() => void} save - 保存文档
 * @property {() => void} open - 打开文档
 * @property {() => void} print - 打印文档
 * @property {() => void} togglePreview - 切换预览
 * @property {() => void} toggleFullscreen - 切换全屏
 */

/**
 * 编辑器操作接口
 * @typedef {Object} EditorActions
 * @property {(prefix: string, suffix: string) => void} insertFormatting - 插入格式化标记
 * @property {() => void} saveDocument - 保存文档
 * @property {() => void} openDocument - 打开文档
 * @property {() => void} printDocument - 打印文档
 * @property {() => void} togglePreview - 切换预览
 * @property {() => void} toggleFullscreen - 切换全屏
 */

/**
 * 注册全局快捷键
 * @param {Element} element - 快捷键绑定的元素
 * @param {Array<ShortcutConfig>} shortcuts - 快捷键配置数组
 * @returns {() => void} - 清理函数
 */
export function registerShortcuts(element, shortcuts) {
  /**
   * 快捷键处理函数
   * @param {Event} evt - 事件对象
   * @returns {boolean|undefined} - 是否阻止默认行为
   */
  const handleKeyDown = function(evt) {
    // 确保是键盘事件
    const event = evt;
    if (!(event instanceof KeyboardEvent)) return;
    
    // 构建快捷键字符串，例如 "ctrl+s"
    const keyString = buildKeyString(event);
    
    // 查找匹配的快捷键
    const matchedShortcut = shortcuts.find(shortcut => {
      return shortcut.key === keyString;
    });
    
    // 如果找到匹配的快捷键，执行回调并阻止默认行为
    if (matchedShortcut) {
      event.preventDefault();
      matchedShortcut.callback(event);
      return false;
    }
  };
  
  // 添加事件监听器
  element.addEventListener('keydown', handleKeyDown);
  
  // 返回清理函数
  return () => {
    element.removeEventListener('keydown', handleKeyDown);
  };
}

/**
 * 为指定编辑器绑定 Markdown 常用快捷键
 * @param {Element} editor - 编辑器元素
 * @param {TextActions} textActions - 文本操作函数集合
 * @returns {() => void} - 清理函数
 */
export function bindEditorShortcuts(editor, textActions) {
  const shortcuts = [
    // 文件操作
    { key: 'ctrl+s', callback: () => textActions.save() },
    { key: 'ctrl+o', callback: () => textActions.open() },
    { key: 'ctrl+p', callback: () => textActions.print() },
    
    // 格式化操作
    { key: 'ctrl+b', callback: () => textActions.format('**', '**') },
    { key: 'ctrl+i', callback: () => textActions.format('*', '*') },
    { key: 'ctrl+`', callback: () => textActions.format('`', '`') },
    { key: 'ctrl+k', callback: () => textActions.link() },
    
    // 标题操作
    { key: 'ctrl+1', callback: () => textActions.heading(1) },
    { key: 'ctrl+2', callback: () => textActions.heading(2) },
    { key: 'ctrl+3', callback: () => textActions.heading(3) },
    
    // LaTeX 操作
    { key: 'ctrl+l', callback: () => textActions.inlineMath() },
    { key: 'ctrl+shift+l', callback: () => textActions.blockMath() },
    
    // 界面操作
    { key: 'ctrl+shift+p', callback: () => textActions.togglePreview() },
    { key: 'f11', callback: () => textActions.toggleFullscreen() },
  ];
  
  return registerShortcuts(editor, shortcuts);
}

/**
 * 将键盘事件转换为快捷键字符串
 * @param {KeyboardEvent} event - 键盘事件
 * @returns {string} - 快捷键字符串，例如 "ctrl+s"
 */
function buildKeyString(event) {
  const keyParts = [];
  
  // 添加修饰键
  if (event.ctrlKey || event.metaKey) keyParts.push('ctrl');
  if (event.altKey) keyParts.push('alt');
  if (event.shiftKey) keyParts.push('shift');
  
  // 添加主键
  let key = event.key.toLowerCase();
  
  // 处理特殊键
  if (key === ' ') key = 'space';
  if (key === 'escape') key = 'esc';
  if (key === 'delete') key = 'del';
  if (key.startsWith('arrow')) key = key.replace('arrow', '');
  
  // 函数键 (F1-F12)
  if (/^f\d+$/.test(key)) {
    // 保持不变
  } 
  // 单个字符键使用小写
  else if (key.length === 1) {
    key = key.toLowerCase();
  }
  
  keyParts.push(key);
  
  return keyParts.join('+');
}

/**
 * 为指定编辑器创建文本插入辅助函数
 * @param {Element} editorElement - 编辑器元素
 * @param {EditorActions} actions - 可用的编辑器操作
 * @returns {TextActions} - 文本操作函数集合
 */
export function createTextActions(editorElement, actions) {
  return {
    // 文本格式化
    format: (prefix, suffix) => {
      actions.insertFormatting(prefix, suffix);
    },
    
    // 标题插入
    heading: (level) => {
      const prefix = '#'.repeat(level) + ' ';
      actions.insertFormatting(prefix, '');
    },
    
    // 链接插入
    link: () => {
      actions.insertFormatting('[链接文本](', ')');
    },
    
    // LaTeX 数学公式
    inlineMath: () => {
      actions.insertFormatting('$', '$');
    },
    
    blockMath: () => {
      actions.insertFormatting('$$\n', '\n$$');
    },
    
    // 文档操作
    save: () => {
      actions.saveDocument();
    },
    
    open: () => {
      actions.openDocument();
    },
    
    print: () => {
      actions.printDocument();
    },
    
    // 界面操作
    togglePreview: () => {
      actions.togglePreview();
    },
    
    toggleFullscreen: () => {
      actions.toggleFullscreen();
    }
  };
}

/**
 * 快捷键描述项
 * @typedef {Object} ShortcutDescription
 * @property {string} key - 快捷键显示文本
 * @property {string} description - 快捷键描述
 */

/**
 * 显示快捷键提示列表 (用于帮助文档)
 * @returns {Array<ShortcutDescription>} - 快捷键列表
 */
export function getShortcutsList() {
  return [
    { key: 'Ctrl+S', description: '保存文档' },
    { key: 'Ctrl+O', description: '打开文档' },
    { key: 'Ctrl+P', description: '打印/导出文档' },
    { key: 'Ctrl+B', description: '粗体' },
    { key: 'Ctrl+I', description: '斜体' },
    { key: 'Ctrl+`', description: '代码' },
    { key: 'Ctrl+K', description: '插入链接' },
    { key: 'Ctrl+1..3', description: '插入1-3级标题' },
    { key: 'Ctrl+L', description: '插入行内公式' },
    { key: 'Ctrl+Shift+L', description: '插入块级公式' },
    { key: 'Ctrl+Shift+P', description: '切换预览' },
    { key: 'F11', description: '切换全屏' },
  ];
} 