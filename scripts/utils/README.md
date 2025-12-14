# 工具脚本 (Utils)

这个目录包含可复用的数据处理和修复工具脚本。

## 脚本列表

### LaTeX 相关

| 脚本 | 用途 | 使用方法 |
|------|------|----------|
| `fix-unicode.ts` | 将 Unicode 数学符号转换为 LaTeX | `bun run scripts/utils/fix-unicode.ts` |
| `fix-latex-escaping.ts` | 修复过度转义的 LaTeX | `bun run scripts/utils/fix-latex-escaping.ts` |
| `wrap-latex.ts` | 为裸露的 LaTeX 语法添加 `$...$` | `bun run scripts/utils/wrap-latex.ts` |
| `wrap-equations.ts` | 为数学表达式添加 `$...$` | `bun run scripts/utils/wrap-equations.ts` |
| `diagnose-latex.ts` | 诊断 LaTeX 转义问题 | `bun run scripts/utils/diagnose-latex.ts` |

## 使用说明

这些脚本通常针对特定的试卷文件进行操作。在运行前，请检查脚本中的 `filePath` 变量，确保指向正确的目标文件。

### 示例

```bash
# 修复 Unicode 符号
bun run scripts/utils/fix-unicode.ts

# 诊断 LaTeX 问题
bun run scripts/utils/diagnose-latex.ts
```

## 注意事项

- 运行前请备份数据或确保 git 状态干净
- 部分脚本会直接修改文件，请谨慎使用
- 建议运行后使用 `bun run validate` 验证数据
