---
description: How to create a new exam paper interactively
---

# 创建新试卷 (Create Paper)

这个工作流程描述如何使用交互式命令创建新的试卷。

## 使用方法

// turbo
1. 在项目根目录运行交互式脚本：
```bash
bun run create-paper
```

2. 按照提示依次完成以下步骤：
   - **选择学科** - 从现有学科中选择或新建学科
   - **选择试卷组** - 从现有试卷组中选择或新建
   - **生成试卷 ID** - 按年份、套次或自定义
   - **选择题目结构模板** - 数学真题、模拟题或自定义
   - **选择生成选项** - assets 目录、同步索引等

3. 确认后，脚本会自动生成：
   - `papers/{paperId}/index.json` - 试卷数据骨架
   - `papers/{paperId}/assets/` - 图片资源目录
   - `papers/{paperId}/assets/README.md` - 图片命名规范

## 生成后的操作

// turbo
4. 将题目图片放入 assets 目录，按照命名规范：
   - `01_q.png` - 第1题题目图片
   - `01_q_thumb.png` - 第1题缩略图 (400px width)
   - `01_a.png` - 第1题解析图片

5. 编辑 `papers/{paperId}/index.json`，填写：
   - `contentMd` / `contentImg` - 题目内容
   - `answerMd` / `answer` - 答案
   - `analysisMd` / `analysisImg` - 解析
   - `tags` - 知识点标签
   - `eureka` - 认知脚手架（可选）

// turbo
6. 运行验证脚本检查数据：
```bash
bun run validate
```

## 文件结构说明

```
papers/{paperId}/
├── index.json          # 试卷数据
└── assets/
    ├── README.md       # 命名规范说明
    ├── 01_q.png        # 第1题题目
    ├── 01_q_thumb.png  # 第1题缩略图
    ├── 01_a.png        # 第1题解析
    ├── 02_q.png        # 第2题题目
    └── ...
```

## 支持的学科

当前支持的学科（`subjectKey`）：
- `math` - 数学
- `english` - 英语
- `politics` - 政治
- `cs` - 计算机

可以在交互时选择"新建学科"添加更多。

## 题目结构模板

### 数学真题 (math-exam)
- 选择题: 10 题 × 5 分
- 填空题: 6 题 × 5 分
- 解答题: 6 题 × 10 分
- 总计: 22 题，150 分

### 数学模拟 (math-mock)
- 与数学真题相同结构

### 自定义 (custom)
- 可自行指定各类题目的数量和分值

## 相关脚本

- `bun run validate` - 验证数据完整性
- `bun run create-paper` - 创建新试卷（本脚本）
