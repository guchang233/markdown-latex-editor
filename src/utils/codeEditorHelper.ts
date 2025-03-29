/**
 * CodeMirror 编辑器助手
 * 
 * 这个模块集中管理 CodeMirror 的实例化和扩展创建，
 * 以避免包引用和多实例问题
 */

import * as state from '@codemirror/state';
import * as view from '@codemirror/view';
import * as langMarkdown from '@codemirror/lang-markdown';
import * as commands from '@codemirror/commands';
import * as language from '@codemirror/language';

// Extract specific exports
const { EditorState } = state;
const { EditorView } = view;
const { markdown } = langMarkdown;
const { defaultKeymap, history, historyKeymap } = commands;
const { syntaxHighlighting, defaultHighlightStyle } = language;

// 统一的扩展实例
let sharedExtensions: any = null;

/**
 * 创建并返回 CodeMirror 编辑器的统一扩展集合
 */
export function getExtensions(updateCallback: (content: string) => void) {
  // 如果已经创建了扩展集合，直接返回
  if (sharedExtensions) {
    return sharedExtensions;
  }
  
  try {
    // 创建基础扩展
    const languageExtension = markdown();
    const historyExtension = history();
    const syntaxExtension = syntaxHighlighting(defaultHighlightStyle);
    const wrappingExtension = EditorView.lineWrapping;
    
    // 创建更新监听器
    const updateListenerExtension = EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        const content = update.state.doc.toString();
        updateCallback(content);
      }
    });
    
    // 组装扩展数组
    sharedExtensions = [
      languageExtension,
      historyExtension,
      syntaxExtension,
      wrappingExtension,
      updateListenerExtension,
      defaultKeymap,
      historyKeymap
    ];
    
    return sharedExtensions;
  } catch (error) {
    console.error('Failed to create CodeMirror extensions:', error);
    throw error;
  }
}

/**
 * 创建 CodeMirror 编辑器实例
 */
export function createEditor(
  container: HTMLElement, 
  content: string,
  updateCallback: (content: string) => void
): view.EditorView {
  try {
    // 获取扩展
    const extensions = getExtensions(updateCallback);
    
    // 创建编辑器状态
    const editorState = EditorState.create({
      doc: content,
      extensions
    });
    
    // 创建编辑器视图
    const editorView = new EditorView({
      state: editorState,
      parent: container
    });
    
    return editorView;
  } catch (error) {
    console.error('Failed to create CodeMirror editor:', error);
    throw error;
  }
}

/**
 * 创建一个简单的文本区域作为备用编辑器
 */
export function createFallbackEditor(
  container: HTMLElement,
  content: string,
  updateCallback: (content: string) => void,
  options: {
    fontSize?: number;
    lineHeight?: number;
    isDarkMode?: boolean;
  } = {}
): HTMLTextAreaElement {
  // 清空容器
  container.innerHTML = '';
  
  // 创建文本区域
  const textarea = document.createElement('textarea');
  textarea.value = content;
  textarea.style.width = '100%';
  textarea.style.height = '100%';
  textarea.style.padding = '16px';
  textarea.style.border = 'none';
  textarea.style.resize = 'none';
  textarea.style.fontFamily = 'monospace';
  textarea.style.fontSize = `${options.fontSize || 16}px`;
  textarea.style.lineHeight = `${options.lineHeight || 1.5}`;
  
  // 设置颜色方案
  if (options.isDarkMode) {
    textarea.style.color = 'var(--color-text-dark)';
    textarea.style.backgroundColor = 'var(--color-bg-dark)';
  } else {
    textarea.style.color = 'var(--color-text-light)';
    textarea.style.backgroundColor = 'var(--color-bg-light)';
  }
  
  // 监听内容变化
  textarea.addEventListener('input', (e) => {
    const newContent = (e.target as HTMLTextAreaElement).value;
    updateCallback(newContent);
  });
  
  // 添加到容器
  container.appendChild(textarea);
  
  return textarea;
}

/**
 * 显示备用编辑器通知
 */
export function showFallbackNotice() {
  const existingNotice = document.querySelector('.fallback-notice');
  if (existingNotice) {
    return; // 通知已存在，不重复添加
  }
  
  const fallbackNotice = document.createElement('div');
  fallbackNotice.className = 'fallback-notice';
  fallbackNotice.innerHTML = `
    <div class="fixed top-4 right-4 bg-yellow-100 dark:bg-yellow-900 p-3 rounded-lg shadow-md max-w-md text-sm z-50">
      <h4 class="font-bold text-yellow-800 dark:text-yellow-200 mb-1">使用备用编辑器</h4>
      <p class="text-yellow-700 dark:text-yellow-300">
        高级编辑器初始化失败，正在使用简单编辑器。某些功能可能受限。
        <button class="mt-2 px-2 py-1 bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 rounded hover:bg-yellow-300 dark:hover:bg-yellow-700 text-xs font-medium"
                onclick="location.reload()">重试加载</button>
      </p>
    </div>
  `;
  document.body.appendChild(fallbackNotice);
} 