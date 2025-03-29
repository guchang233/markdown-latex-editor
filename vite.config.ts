/// <reference types="node" />
import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import UnoCSS from 'unocss/vite';
import { resolve } from 'path';
import sveltePreprocess from 'svelte-preprocess';

// 添加 Node.js 进程环境类型声明
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV?: string;
    }
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    UnoCSS(),
    svelte({
      // enable run-time checks when not in production
      compilerOptions: {
        dev: process.env.NODE_ENV !== 'production'
      },
      // Add preprocessor for TypeScript 
      preprocess: sveltePreprocess({
        typescript: {
          compilerOptions: {
            verbatimModuleSyntax: true,
            isolatedModules: true
          }
        }
      })
    })
  ],
  esbuild: {
    logOverride: { 'unsupported-jsx-comment': 'silent' },
    // Add target to avoid syntax issues
    target: 'es2020'
  },
  // 解决方案：确保所有 @codemirror/* 包引用同一个实例
  resolve: {
    dedupe: [
      '@codemirror/state',
      '@codemirror/view',
      '@codemirror/language',
      '@codemirror/commands',
      '@codemirror/lang-markdown'
    ],
    alias: {
      '@codemirror/state': resolve(__dirname, 'node_modules/@codemirror/state'),
      '@codemirror/view': resolve(__dirname, 'node_modules/@codemirror/view'),
      '@codemirror/language': resolve(__dirname, 'node_modules/@codemirror/language'),
      '@codemirror/commands': resolve(__dirname, 'node_modules/@codemirror/commands'),
      '@codemirror/lang-markdown': resolve(__dirname, 'node_modules/@codemirror/lang-markdown')
    }
  },
  // Optimize for faster development experience
  build: {
    target: 'esnext',
    minify: 'terser',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: {
          codemirror: ['@codemirror/lang-markdown', '@codemirror/language', '@codemirror/state', '@codemirror/view', '@codemirror/commands'],
          'markdown-libs': ['remarkable', 'prismjs'],
          'math-libs': ['katex']
        }
      }
    }
  },
  optimizeDeps: {
    include: ['@codemirror/state', '@codemirror/view', '@codemirror/language', '@codemirror/commands', '@codemirror/lang-markdown', 'remarkable', 'katex', 'prismjs'],
    // 强制预构建，确保依赖被正确地捆绑
    force: true
  },
  server: {
    watch: {
      usePolling: true
    }
  }
}); 