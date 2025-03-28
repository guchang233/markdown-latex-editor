# MarkTeX 编辑器使用指南

欢迎使用 MarkTeX 编辑器，这是一款高性能的 Markdown 和 LaTeX 混合编辑器。本指南将帮助您熟悉编辑器的各项功能。

## 基本界面

MarkTeX 编辑器的界面由以下部分组成：

- **顶部导航栏**：包含应用标题和导出按钮
- **工具栏**：提供常用的 Markdown 格式化工具
- **编辑区域**：左侧为 Markdown 编辑器，右侧为实时预览
- **主题切换按钮**：右下角的按钮用于切换明暗主题

## Markdown 编辑

### 基本语法

MarkTeX 支持标准 Markdown 语法：

```markdown
# 一级标题
## 二级标题
### 三级标题

**粗体文本** 或 __粗体文本__
*斜体文本* 或 _斜体文本_
~~删除线文本~~

[链接文本](https://example.com)
![图片描述](https://example.com/image.jpg)

- 无序列表项
- 无序列表项
  - 嵌套项

1. 有序列表项
2. 有序列表项
   1. 嵌套项

> 引用文本
```

### 扩展语法

MarkTeX 还支持 GitHub Flavored Markdown (GFM) 扩展语法：

```markdown
## 任务列表
- [x] 已完成任务
- [ ] 未完成任务

## 表格
| 表头1 | 表头2 | 表头3 |
|-------|-------|-------|
| 单元格1 | 单元格2 | 单元格3 |
| 单元格4 | 单元格5 | 单元格6 |

## 代码块
```javascript
function hello() {
  console.log("Hello, world!");
}
```
```

### 工具栏快捷按钮

工具栏提供了以下格式化快捷按钮：

- **B**：添加粗体格式
- **I**：添加斜体格式
- **S**：添加删除线
- **C**：添加行内代码
- **L**：插入链接
- **I**：插入图片
- **T**：插入表格
- **F**：插入数学公式
- 等等...

## LaTeX 数学公式

MarkTeX 支持 LaTeX 数学公式语法，可以插入行内公式和块级公式：

### 行内公式

使用单个美元符号包裹公式：

```
这是一个行内公式 $E = mc^2$ 在文本中的示例。
```

### 块级公式

使用双美元符号包裹公式：

```
$$
\int_{a}^{b} f(x) \, dx = F(b) - F(a)
$$
```

### 常用数学符号

- 上标：`x^2`
- 下标：`x_i`
- 分数：`\frac{a}{b}`
- 开方：`\sqrt{x}` 或 `\sqrt[n]{x}`
- 积分：`\int_a^b f(x) \, dx`
- 求和：`\sum_{i=1}^n x_i`
- 希腊字母：`\alpha`, `\beta`, `\gamma`, `\delta`, ...
- 矩阵：
  ```
  $$
  \begin{pmatrix}
  a & b \\
  c & d
  \end{pmatrix}
  $$
  ```

## 文档管理

### 自动保存

MarkTeX 会自动保存您的文档到浏览器的 IndexedDB 存储中，无需手动保存。

### 版本历史

系统会自动保存最近的 10 个版本，让您可以在需要时恢复之前的内容。

### 导出文档

点击顶部导航栏中的"导出"按钮，可以将当前文档导出为 Markdown 文件。

## 键盘快捷键

MarkTeX 支持多种键盘快捷键，提高编辑效率：

- **Ctrl+B**：粗体
- **Ctrl+I**：斜体
- **Ctrl+K**：插入链接
- **Tab**：在列表中增加缩进
- **Shift+Tab**：在列表中减少缩进

## 性能优化提示

- 对于非常长的文档，建议分段编辑
- 复杂的 LaTeX 公式可能需要更长的渲染时间
- 如有数十张图片，建议分批添加

## 浏览器兼容性

MarkTeX 编辑器在以下浏览器中测试良好：

- Google Chrome (最新版)
- Mozilla Firefox (最新版)
- Microsoft Edge (最新版)
- Safari (最新版)

## 反馈与支持

如有问题或建议，请通过以下方式联系我们：

- GitHub Issues: https://github.com/yourusername/marktex-editor/issues
- 电子邮件: support@example.com

感谢使用 MarkTeX 编辑器！ 