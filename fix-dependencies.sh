#!/bin/bash

echo "===================================="
echo "= CodeMirror 依赖修复工具"
echo "===================================="
echo
echo "这个脚本将修复 CodeMirror 相关包的版本问题，"
echo "解决 'Unrecognized extension value in extension set' 错误。"
echo
echo "警告: 这将删除 node_modules 文件夹并重新安装所有依赖。"
echo

read -p "是否继续? (y/N): " confirm
if [[ "$confirm" != [yY] ]]; then
  echo "操作已取消。"
  exit 0
fi

echo
echo "正在运行修复脚本..."
echo

node fix-dependencies.js

if [ $? -ne 0 ]; then
  echo
  echo "修复失败！请检查上面的错误信息。"
  exit 1
fi

echo
echo "===================================="
echo "修复完成！请重新启动开发服务器:"
echo "npm run dev"
echo "====================================" 