import sveltePreprocess from 'svelte-preprocess';

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
};