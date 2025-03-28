/**
 * Markdown and LaTeX渲染器
 * 提供Markdown语法和LaTeX数学公式的渲染
 */

// 类型声明 - 使用any类型来避免模块解析问题
declare const katex: any;

// Simple markdown renderer
export function renderMarkdown(markdownText: string): string {
  try {
    console.log('开始渲染Markdown，长度:', markdownText.length);
    
    // 第一步：处理并保护LaTeX公式，替换为占位符
    const placeholders: {[key: string]: string} = {};
    let counter = 0;
    
    // 处理块级LaTeX公式
    let processedText = markdownText.replace(/\$\$([\s\S]*?)\$\$/g, (match, formula) => {
      const placeholder = `__LATEX_BLOCK_${counter++}__`;
      placeholders[placeholder] = match;
      return placeholder;
    });
    
    // 处理内联LaTeX公式
    processedText = processedText.replace(/\$([^\$\n]+?)\$/g, (match, formula) => {
      const placeholder = `__LATEX_INLINE_${counter++}__`;
      placeholders[placeholder] = match;
      return placeholder;
    });
    
    // 第二步：处理Markdown
    console.log('处理Markdown文本，长度:', processedText.length);
    let html = processMarkdown(processedText);
    console.log('Markdown处理完成，HTML长度:', html.length);
    
    // 第三步：将LaTeX占位符替换回公式，并用KaTeX渲染
    if (typeof window !== 'undefined' && (window as any).katex) {
      const katexInstance = (window as any).katex;
      
      // 还原并处理块级LaTeX公式
      for (let i = 0; i < counter; i++) {
        const blockPlaceholder = `__LATEX_BLOCK_${i}__`;
        const inlinePlaceholder = `__LATEX_INLINE_${i}__`;
        
        if (html.includes(blockPlaceholder)) {
          const original = placeholders[blockPlaceholder];
          const formula = original.replace(/^\$\$([\s\S]*?)\$\$$/g, '$1');
          
          try {
            const rendered = katexInstance.renderToString(formula, {
              throwOnError: false,
              displayMode: true
            });
            html = html.replace(blockPlaceholder, rendered);
          } catch (error) {
            console.error('块级LaTeX渲染错误:', error);
            html = html.replace(blockPlaceholder, 
              `<div class="latex-error" title="${error instanceof Error ? error.message : 'Unknown error'}">${original}</div>`);
          }
        }
        
        if (html.includes(inlinePlaceholder)) {
          const original = placeholders[inlinePlaceholder];
          const formula = original.replace(/^\$([^\$]+)\$$/g, '$1');
          
          try {
            const rendered = katexInstance.renderToString(formula, {
              throwOnError: false,
              displayMode: false
            });
            html = html.replace(inlinePlaceholder, rendered);
          } catch (error) {
            console.error('内联LaTeX渲染错误:', error);
            html = html.replace(inlinePlaceholder, 
              `<span class="latex-error" title="${error instanceof Error ? error.message : 'Unknown error'}">${original}</span>`);
          }
        }
      }
    } else {
      // KaTeX不可用时，简单替换回原始文本
      for (const [placeholder, original] of Object.entries(placeholders)) {
        if (placeholder.startsWith('__LATEX_BLOCK_')) {
          html = html.replace(placeholder, `<div class="math-block">${original.replace(/^\$\$([\s\S]*?)\$\$$/g, '$1')}</div>`);
        } else if (placeholder.startsWith('__LATEX_INLINE_')) {
          html = html.replace(placeholder, `<span class="math-inline">${original.replace(/^\$([^\$]+)\$$/g, '$1')}</span>`);
        }
      }
      
      console.warn('KaTeX库不可用，使用备用渲染方式。请确保已加载KaTeX。');
    }
    
    // 输出结果摘要
    const previewHtml = html.substring(0, 200) + (html.length > 200 ? '...' : '');
    console.log('渲染结果预览:', previewHtml);
    
    return html;
  } catch (error) {
    console.error('Markdown渲染错误:', error);
    return `<div class="error">Error rendering markdown: ${error instanceof Error ? error.message : 'Unknown error'}</div>`;
  }
}

/**
 * 基础Markdown处理
 */
function processMarkdown(text: string): string {
  // 首先处理表格
  text = processMarkdownTables(text);
  
  // 处理代码块
  text = text.replace(/```([^`]*?)```/gs, (match, code) => {
    // 转义代码块中的<和>以避免HTML注入
    const safeCode = code
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    return `<pre><code>${safeCode}</code></pre>`;
  });
  
  // 标题处理
  let html = text
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>');
  
  // 基本格式化
  html = html
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    .replace(/~~(.*?)~~/gim, '<del>$1</del>')
    .replace(/`([^`]+)`/gim, '<code>$1</code>');
  
  // 链接
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2">$1</a>');
  
  // 图片
  html = html.replace(/!\[([^\]]+)\]\(([^)]+)\)/gim, '<img src="$2" alt="$1">');
  
  // 列表
  html = html
    .replace(/^\s*\*\s(.*$)/gim, '<li>$1</li>')
    .replace(/^\s*-\s(.*$)/gim, '<li>$1</li>')
    .replace(/^\s*\d+\.\s(.*$)/gim, '<li>$1</li>');
  
  // 包装列表
  html = html
    .replace(/<li>(.+)<\/li>\n<li>/gim, '<li>$1</li>\n<li>')
    .replace(/(<li>(.+)<\/li>\n)+/gim, '<ul>$&</ul>');
  
  // 处理任务列表
  html = html
    .replace(/<li>\[\s\] (.*?)<\/li>/gim, '<li class="task-list-item"><input type="checkbox" disabled> $1</li>')
    .replace(/<li>\[x\] (.*?)<\/li>/gim, '<li class="task-list-item"><input type="checkbox" checked disabled> $1</li>');
  
  // 换行转为<br>标签
  html = html.replace(/\n/gim, '<br>');
  
  return html;
}

/**
 * 单独处理 Markdown 表格
 */
function processMarkdownTables(text: string): string {
  // 先分割文本为行
  const lines = text.split('\n');
  let inTable = false;
  let tableLines: string[] = [];
  let result: string[] = [];
  
  console.log('原始文本行数:', lines.length);
  
  // 处理每一行
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();
    
    // 简化表格行检测：如果包含至少两个管道符并且至少一个在开头或结尾
    const isPotentialTableRow = trimmedLine.includes('|') && 
                                (trimmedLine.startsWith('|') || trimmedLine.endsWith('|')) &&
                                (trimmedLine.split('|').length >= 3);
    
    if (isPotentialTableRow) {
      // 如果不在表格中，检查是否是有效表格的开始
      if (!inTable) {
        // 检查下一行是否是分隔符行：包含至少一个破折号且包含管道符
        if (i + 1 < lines.length && 
            lines[i + 1].includes('|') && 
            lines[i + 1].includes('-')) {
          inTable = true;
          tableLines = [line];
          console.log('检测到表格开始:', line);
        } else {
          // 不是表格，正常添加
          result.push(line);
        }
      } else {
        // 已经在表格中，继续收集表格行
        tableLines.push(line);
      }
    } else {
      // 非表格行
      if (inTable) {
        // 已经收集了表格的所有行，处理表格
        const tableHtml = convertTableToHtml(tableLines);
        result.push(tableHtml);
        console.log('表格行数:', tableLines.length, '转换后:', tableHtml);
        inTable = false;
        tableLines = [];
      }
      result.push(line);
    }
  }
  
  // 如果文本结束时仍在表格中
  if (inTable && tableLines.length > 0) {
    const tableHtml = convertTableToHtml(tableLines);
    result.push(tableHtml);
    console.log('文末表格行数:', tableLines.length, '转换后:', tableHtml);
  }
  
  return result.join('\n');
}

/**
 * 将Markdown表格行转换为HTML表格
 */
function convertTableToHtml(tableLines: string[]): string {
  if (tableLines.length < 2) return tableLines.join('\n');
  
  console.log('转换表格, 行数:', tableLines.length);
  
  const headerLine = tableLines[0];
  const separatorLine = tableLines[1];
  const dataLines = tableLines.slice(2);
  
  // 清理单元格函数
  function cleanCells(line: string): string[] {
    // 处理首尾的管道符
    let cleaned = line.trim();
    if (cleaned.startsWith('|')) {
      cleaned = cleaned.substring(1);
    }
    if (cleaned.endsWith('|')) {
      cleaned = cleaned.substring(0, cleaned.length - 1);
    }
    // 分割并返回非空单元格
    return cleaned.split('|').map(cell => cell.trim());
  }
  
  // 处理表头
  const headerCells = cleanCells(headerLine);
  let tableHtml = '<table class="md-table"><thead><tr>';
  
  for (const cell of headerCells) {
    tableHtml += `<th>${cell}</th>`;
  }
  
  tableHtml += '</tr></thead><tbody>';
  
  // 处理数据行
  for (const line of dataLines) {
    const cells = cleanCells(line);
    if (cells.length > 0) {
      tableHtml += '<tr>';
      for (const cell of cells) {
        tableHtml += `<td>${cell}</td>`;
      }
      tableHtml += '</tr>';
    }
  }
  
  tableHtml += '</tbody></table>';
  
  console.log('生成HTML表格:', tableHtml.substring(0, 100) + '...');
  
  return tableHtml;
}

/**
 * HTML清理以防止XSS攻击
 * 这是一个简化实现
 */
export function sanitizeHtml(html: string): string {
  // 在实际应用中，我们会使用DOMPurify等库
  // 这里只是简单地移除script标签
  return html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
}

/**
 * 从Markdown文本中提取所有LaTeX公式
 * 用于错误高亮
 */
export function extractLatexFormulas(markdownText: string): { inline: string[], block: string[] } {
  const inline: string[] = [];
  const block: string[] = [];
  
  // 提取内联公式
  const inlineRegex = /\$([^$\n]+)\$/g;
  let match;
  // eslint-disable-next-line no-cond-assign
  while ((match = inlineRegex.exec(markdownText)) !== null) {
    inline.push(match[1]);
  }
  
  // 提取块级公式
  const blockRegex = /\$\$([\s\S]*?)\$\$/g;
  // eslint-disable-next-line no-cond-assign
  while ((match = blockRegex.exec(markdownText)) !== null) {
    block.push(match[1]);
  }
  
  return { inline, block };
}

/**
 * 验证LaTeX公式并返回任何错误
 */
export function validateLatexFormula(formula: string): { isValid: boolean; error?: string } {
  try {
    if (typeof window !== 'undefined' && (window as any).katex) {
      (window as any).katex.renderToString(formula, { throwOnError: true });
      return { isValid: true };
    } else {
      // 简化验证 (仅检查基本的大括号平衡)
      const openBraces = (formula.match(/\{/g) || []).length;
      const closeBraces = (formula.match(/\}/g) || []).length;
      
      if (openBraces !== closeBraces) {
        return { 
          isValid: false, 
          error: `括号不平衡: ${openBraces}个开括号 vs ${closeBraces}个闭括号` 
        };
      }
      
      return { isValid: true };
    }
  } catch (e) {
    return { 
      isValid: false, 
      error: e instanceof Error ? e.message : 'Unknown error' 
    };
  }
}