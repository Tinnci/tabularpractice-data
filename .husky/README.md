# Git Hooks

本项目使用 Husky 管理 Git Hooks，确保代码质量。

## 🎣 已配置的 Hooks

### pre-commit
在每次 `git commit` 之前自动运行：
- ✅ 数据验证脚本 (`bun run validate`)
- 如果验证失败，commit 会被阻止

## 📝 说明

pre-commit hook 会：
1. 运行 `scripts/validate.ts` 检查所有数据文件
2. 验证 JSON 格式、eureka 内容格式等
3. 如果发现错误或警告超标，阻止提交并显示错误信息

## 🔧 如何临时跳过 Hook（不推荐）

如果确实需要跳过验证（极不推荐），可以使用：
```bash
git commit --no-verify -m "your message"
```

## 🚀 团队协作

其他开发者克隆项目后，运行 `bun install` 会自动设置这些 hooks。
