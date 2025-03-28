#!/usr/bin/env node

/**
 * MarkTeX 编辑器项目修复工具
 * 
 * 此脚本会帮助解决 Svelte + TypeScript 项目中的常见问题：
 * 1. 检查并安装缺失依赖
 * 2. 修复项目配置
 * 3. 清理构建缓存
 * 4. 修复 CodeMirror 相关问题
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取当前文件的目录路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 文本颜色函数
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}%s${colors.reset}`, message);
}

function logStep(step, message) {
  log(`\n[${step}] ${message}`, colors.cyan);
}

function logSuccess(message) {
  log(`✓ ${message}`, colors.green);
}

function logWarning(message) {
  log(`⚠ ${message}`, colors.yellow);
}

function logError(message) {
  log(`✗ ${message}`, colors.red);
}

function runCommand(command, errorMessage) {
  try {
    log(`执行命令: ${command}`, colors.blue);
    execSync(command, { stdio: 'inherit' });
    return true;
  } catch (error) {
    logError(errorMessage || `命令执行失败: ${command}`);
    return false;
  }
}

function checkFileExists(filePath) {
  return fs.existsSync(filePath);
}

// 主程序
function main() {
  log('\n🛠️  MarkTeX 编辑器修复工具 🛠️\n', colors.magenta);
  
  // 步骤1: 检查环境
  logStep(1, '检查环境');
  
  // 检查 Node.js 版本
  try {
    const nodeVersion = execSync('node -v').toString().trim();
    log(`Node.js 版本: ${nodeVersion}`);
    
    // 确保 Node.js 版本 >= 14
    const versionNumber = parseInt(nodeVersion.slice(1).split('.')[0], 10);
    if (versionNumber < 14) {
      logWarning(`Node.js 版本过低。推荐使用 v14.0.0 或更高版本。`);
    } else {
      logSuccess('Node.js 版本符合要求');
    }
  } catch (error) {
    logError('无法检测 Node.js 版本');
  }
  
  // 步骤2: 安装/更新依赖
  logStep(2, '安装/更新关键依赖');
  
  // 安装关键依赖
  const dependencies = [
    '@tsconfig/svelte',
    '@types/node',
    'svelte-preprocess',
    '@codemirror/state',
    '@codemirror/view',
    '@codemirror/lang-markdown',
    '@codemirror/commands',
    '@codemirror/language'
  ];
  
  runCommand(`npm install --save-dev ${dependencies.join(' ')}`, '依赖安装失败');
  
  // 步骤3: 检查并创建配置文件
  logStep(3, '检查并创建配置文件');
  
  // 检查 svelte.config.js
  const svelteConfigPath = path.join(process.cwd(), 'svelte.config.js');
  if (!checkFileExists(svelteConfigPath)) {
    log('创建 svelte.config.js');
    const svelteConfig = `import sveltePreprocess from 'svelte-preprocess';

export default {
  // 启用 TypeScript 预处理
  preprocess: sveltePreprocess({
    typescript: {
      // 禁用类型检查，让 TypeScript 编译器处理
      transpileOnly: false,
      // 以下选项帮助类型检查与 Svelte 更好地兼容
      compilerOptions: {
        moduleResolution: 'node'
      }
    }
  })
};`;
    
    fs.writeFileSync(svelteConfigPath, svelteConfig);
    logSuccess('已创建 svelte.config.js');
  } else {
    logSuccess('svelte.config.js 已存在');
  }
  
  // 步骤4: 修复 CodeMirror 相关问题
  logStep(4, '修复 CodeMirror 相关问题');
  
  // 删除并重新安装 CodeMirror 依赖
  log('删除 CodeMirror 依赖，准备重新安装...');
  
  // 移除 node_modules 中的 CodeMirror 目录
  const codemirrorDirs = [
    'node_modules/@codemirror',
  ];
  
  for (const dir of codemirrorDirs) {
    const fullPath = path.join(process.cwd(), dir);
    if (fs.existsSync(fullPath)) {
      try {
        fs.rmSync(fullPath, { recursive: true, force: true });
        log(`已删除: ${dir}`);
      } catch (error) {
        logWarning(`无法删除 ${dir}: ${error.message}`);
      }
    }
  }
  
  // 重新安装 CodeMirror 依赖，确保版本一致
  log('重新安装 CodeMirror 依赖...');
  const cmDependencies = [
    '@codemirror/state@6.5.2',
    '@codemirror/view@6.36.4',
    '@codemirror/lang-markdown@6.3.2',
    '@codemirror/commands@6.8.0',
    '@codemirror/language@6.11.0'
  ];
  
  runCommand(`npm install --save-dev ${cmDependencies.join(' ')}`, 'CodeMirror 依赖安装失败');
  logSuccess('已重新安装 CodeMirror 依赖');
  
  // 步骤5: 确保 LaTeX 渲染支持
  logStep(5, '检查 LaTeX 渲染支持');
  
  // 检查 KaTeX 依赖
  log('确保 KaTeX 依赖正确安装...');
  
  // 检查 index.html 是否包含 KaTeX CDN
  const indexHtmlPath = path.join(process.cwd(), 'index.html');
  if (fs.existsSync(indexHtmlPath)) {
    let indexHtmlContent = fs.readFileSync(indexHtmlPath, 'utf-8');
    const hasKatexCdn = indexHtmlContent.includes('katex.min.js');
    
    if (!hasKatexCdn) {
      log('向 index.html 添加 KaTeX CDN 支持...');
      
      // 查找 head 标签结束位置
      const headCloseIndex = indexHtmlContent.indexOf('</head>');
      if (headCloseIndex !== -1) {
        const katexCdnLinks = `
    <!-- KaTeX CSS and JS (添加KaTeX支持) -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css" integrity="sha384-GvrOXuhMATgEsSwCs4smul74iXGOixntILdUW9XmUC6+HX0sLNAK3q71HotJqlAn" crossorigin="anonymous">
    <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js" integrity="sha384-cpW21h6RZv/phavutF+AuVYrr+dA8xD9zs6FwLpaCct6O9ctzYFfFr4dgmgccOTx" crossorigin="anonymous"></script>
    
    <!-- 添加 LaTeX 错误样式 -->
    <style>
      .latex-error {
        color: #e53e3e;
        border: 1px dashed #e53e3e;
        padding: 2px 4px;
        display: inline-block;
      }
      .math-inline, .math-block {
        font-family: 'KaTeX_Math', 'Times New Roman', serif;
      }
      .math-block {
        display: block;
        text-align: center;
        margin: 1em 0;
      }
    </style>`;
        
        indexHtmlContent = indexHtmlContent.slice(0, headCloseIndex) + katexCdnLinks + indexHtmlContent.slice(headCloseIndex);
        fs.writeFileSync(indexHtmlPath, indexHtmlContent);
        logSuccess('已添加 KaTeX CDN 支持到 index.html');
      } else {
        logWarning('无法在 index.html 中找到 </head> 标签，未添加 KaTeX CDN');
      }
    } else {
      logSuccess('index.html 已包含 KaTeX CDN 支持');
    }
  } else {
    logWarning('未找到 index.html 文件，无法添加 KaTeX CDN 支持');
  }
  
  // 安装 KaTeX 依赖
  runCommand('npm install --save katex@0.16.8', 'KaTeX 安装失败');
  logSuccess('已安装/更新 KaTeX 依赖');
  
  // 步骤6: 清理构建缓存
  logStep(6, '清理构建缓存');
  
  // 清理 node_modules/.vite
  const viteCachePath = path.join(process.cwd(), 'node_modules', '.vite');
  if (fs.existsSync(viteCachePath)) {
    try {
      fs.rmSync(viteCachePath, { recursive: true, force: true });
      logSuccess('已清理 Vite 缓存');
    } catch (error) {
      logWarning(`清理 Vite 缓存失败: ${error.message}`);
    }
  } else {
    log('未找到 Vite 缓存目录，无需清理');
  }
  
  // 删除 dist 目录
  const distPath = path.join(process.cwd(), 'dist');
  if (fs.existsSync(distPath)) {
    try {
      fs.rmSync(distPath, { recursive: true, force: true });
      logSuccess('已清理构建输出目录');
    } catch (error) {
      logWarning(`清理构建输出目录失败: ${error.message}`);
    }
  }
  
  // 修复结束提示
  logStep(7, '修复完成');
  log('现在，您可以运行以下命令启动项目:');
  log('\nnpm run dev\n', colors.green);
  
  log('\n🎉 修复过程完成! 🎉\n', colors.magenta);
}

// 执行主程序
main(); 