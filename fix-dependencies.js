/**
 * 依赖修复脚本
 * 
 * 这个脚本用于修复 CodeMirror 相关包的版本问题，
 * 确保所有包使用相同的版本，避免 instanceof 检查失败。
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 清理日志函数
function log(message) {
  console.log(`[依赖修复] ${message}`);
}

// 执行命令函数
function exec(command) {
  log(`执行: ${command}`);
  execSync(command, { stdio: 'inherit' });
}

// 开始修复
log('开始修复 CodeMirror 依赖问题...');

// 1. 删除 node_modules 和锁文件
log('清理现有依赖...');
try {
  if (fs.existsSync('node_modules')) {
    if (process.platform === 'win32') {
      // Windows 需要使用特殊命令删除长路径
      exec('rmdir /s /q node_modules');
    } else {
      exec('rm -rf node_modules');
    }
  }
  
  // 删除锁文件
  const lockFiles = ['package-lock.json', 'yarn.lock', 'pnpm-lock.yaml'];
  for (const file of lockFiles) {
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
      log(`已删除 ${file}`);
    }
  }
} catch (error) {
  log(`清理失败: ${error.message}`);
  process.exit(1);
}

// 2. 更新 package.json 中的 CodeMirror 依赖版本
log('更新 package.json 中的 CodeMirror 依赖版本...');
try {
  const packageJsonPath = path.resolve(process.cwd(), 'package.json');
  const packageJson = require(packageJsonPath);

  // 定义所需固定版本的 CodeMirror 包
  const codemirrorPackages = {
    '@codemirror/state': '^6.5.2',
    '@codemirror/view': '^6.36.4',
    '@codemirror/language': '^6.11.0',
    '@codemirror/commands': '^6.8.0',
    '@codemirror/lang-markdown': '^6.3.2'
  };
  
  let changed = false;
  
  // 更新开发依赖
  if (packageJson.devDependencies) {
    for (const [pkg, version] of Object.entries(codemirrorPackages)) {
      if (packageJson.devDependencies[pkg] && packageJson.devDependencies[pkg] !== version) {
        log(`更新 ${pkg} 从 ${packageJson.devDependencies[pkg]} 到 ${version}`);
        packageJson.devDependencies[pkg] = version;
        changed = true;
      }
    }
  }
  
  // 更新生产依赖
  if (packageJson.dependencies) {
    for (const [pkg, version] of Object.entries(codemirrorPackages)) {
      if (packageJson.dependencies[pkg] && packageJson.dependencies[pkg] !== version) {
        log(`更新 ${pkg} 从 ${packageJson.dependencies[pkg]} 到 ${version}`);
        packageJson.dependencies[pkg] = version;
        changed = true;
      }
    }
  }
  
  // 如果有变动，写回文件
  if (changed) {
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    log('已更新 package.json');
  } else {
    log('package.json 中的依赖版本已经是最新的');
  }
} catch (error) {
  log(`更新 package.json 失败: ${error.message}`);
  process.exit(1);
}

// 3. 重新安装依赖
log('重新安装依赖...');
try {
  // 检测当前使用的包管理器
  const hasYarn = fs.existsSync('yarn.lock');
  const hasPnpm = fs.existsSync('pnpm-lock.yaml');
  
  if (hasPnpm) {
    exec('pnpm install');
  } else if (hasYarn) {
    exec('yarn install');
  } else {
    exec('npm install');
  }
} catch (error) {
  log(`安装依赖失败: ${error.message}`);
  process.exit(1);
}

// 4. 清理 Vite 缓存
log('清理 Vite 缓存...');
try {
  const cacheDir = path.resolve(process.cwd(), 'node_modules/.vite');
  if (fs.existsSync(cacheDir)) {
    if (process.platform === 'win32') {
      exec('rmdir /s /q "node_modules\\.vite"');
    } else {
      exec('rm -rf node_modules/.vite');
    }
  }
} catch (error) {
  log(`清理 Vite 缓存失败: ${error.message}`);
  // 继续执行，不中断
}

// 5. 完成
log('依赖修复完成！');
log('请重新启动开发服务器: npm run dev'); 