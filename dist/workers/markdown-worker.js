/**
 * Markdown Processing Web Worker
 * This worker handles the heavy processing tasks for markdown rendering
 * to prevent blocking the main UI thread.
 */

// In a real implementation, we would import libraries like:
// import { Remarkable } from 'remarkable';
// import { highlightAll } from 'prismjs';
// import katex from 'katex';

// Since we can't import modules directly in a worker, we'd load them via importScripts
// importScripts('https://cdn.jsdelivr.net/npm/remarkable@2.0.1/dist/remarkable.min.js');
// importScripts('https://cdn.jsdelivr.net/npm/prismjs@1.29.0/prism.min.js');
// importScripts('https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js');

// Simple markdown parser implementation
function parseMarkdown(text) {
  // This is a simplified implementation
  // In a real app, we would use the Remarkable library
  
  // Simple heading processing
  let html = text
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>');
  
  // Basic formatting
  html = html
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    .replace(/~~(.*?)~~/gim, '<del>$1</del>')
    .replace(/`([^`]+)`/gim, '<code>$1</code>');
  
  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2">$1</a>');
  
  // Images
  html = html.replace(/!\[([^\]]+)\]\(([^)]+)\)/gim, '<img src="$2" alt="$1">');
  
  // Lists
  html = html
    .replace(/^\s*\*\s(.*$)/gim, '<li>$1</li>')
    .replace(/^\s*-\s(.*$)/gim, '<li>$1</li>')
    .replace(/^\s*\d+\.\s(.*$)/gim, '<li>$1</li>');
  
  // Wrap lists
  html = html
    .replace(/<li>(.+)<\/li>\n<li>/gim, '<li>$1</li>\n<li>')
    .replace(/(<li>(.+)<\/li>\n)+/gim, '<ul>$&</ul>');
  
  // Task lists
  html = html
    .replace(/<li>\[\s\] (.*?)<\/li>/gim, '<li class="task-list-item"><input type="checkbox" disabled> $1</li>')
    .replace(/<li>\[x\] (.*?)<\/li>/gim, '<li class="task-list-item"><input type="checkbox" checked disabled> $1</li>');
  
  // Code blocks
  html = html.replace(/```([^`]+)```/gim, '<pre><code>$1</code></pre>');
  
  // Tables (basic support)
  html = html
    .replace(/^\|(.*)\|$/gim, '<tr>$1</tr>')
    .replace(/\|([^|]+)\|/gim, '<td>$1</td>')
    .replace(/(<tr>.*?<\/tr>\n)+/gim, '<table>$&</table>');
  
  // LaTeX math (simplified)
  html = html.replace(/\$([^$]+)\$/gim, '<span class="math">$1</span>');
  html = html.replace(/\$\$([\s\S]*?)\$\$/gim, '<div class="math-block">$1</div>');
  
  // Convert newlines to <br> tags
  html = html.replace(/\n/gim, '<br>');
  
  return html;
}

// Extract and validate LaTeX formulas
function validateLatex(text) {
  const formulas = [];
  const errors = [];
  
  // Extract inline formulas
  const inlineRegex = /\$([^$]+)\$/g;
  let match;
  while ((match = inlineRegex.exec(text)) !== null) {
    formulas.push({ formula: match[1], type: 'inline', position: match.index });
  }
  
  // Extract block formulas
  const blockRegex = /\$\$([\s\S]*?)\$\$/g;
  while ((match = blockRegex.exec(text)) !== null) {
    formulas.push({ formula: match[1], type: 'block', position: match.index });
  }
  
  // Validate each formula
  formulas.forEach(item => {
    // Simple validation - check for balanced braces
    const openBraces = (item.formula.match(/\{/g) || []).length;
    const closeBraces = (item.formula.match(/\}/g) || []).length;
    
    if (openBraces !== closeBraces) {
      errors.push({
        formula: item.formula,
        type: item.type,
        position: item.position,
        error: `Unbalanced braces: ${openBraces} opening vs ${closeBraces} closing`
      });
    }
  });
  
  return {
    formulas,
    errors
  };
}

// Handle worker messages
self.addEventListener('message', function(e) {
  const { type, data, id } = e.data;
  
  switch (type) {
    case 'parse':
      try {
        // Process the markdown
        const html = parseMarkdown(data);
        
        // Validate LaTeX formulas
        const latexValidation = validateLatex(data);
        
        // Send back results
        self.postMessage({
          id,
          type: 'parse-result',
          html,
          latexValidation
        });
      } catch (error) {
        self.postMessage({
          id,
          type: 'error',
          error: error.message
        });
      }
      break;
      
    default:
      self.postMessage({
        id,
        type: 'error',
        error: `Unknown command: ${type}`
      });
  }
}); 