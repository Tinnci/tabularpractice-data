# TabularPractice Data Repository Structure

This document describes the structure for the decoupled data repository.

## 📂 Directory Structure

```text
/
├── index.json            # [Required] The master index file
├── tags.json             # [Required] Knowledge tree structure
├── paperGroups.json      # [Required] Exam group definition (Unified/Self-Proposed)
├── papers/               # [Required] Folder containing individual paper details
│   ├── math1-2025/       # Subdirectory for each paper
│   │   ├── index.json    # The paper's data file
│   │   └── assets/       # Images for this paper
│   │       ├── 01_q.png  # Question 1 Image
│   │       ├── 01_q_thumb.png # [New] Question 1 Thumbnail (400px width)
│   │       ├── 01_a.png  # Question 1 Analysis Image
│   │       └── ...
│   ├── math1-2024/
│   └── ...
```

## 📄 File Formats

### 1. `index.json`
Master index loaded on initial page load.

**Schema:**
```json
[
  {
    "id": "math1-2025-01",      // Unique ID
    "paperId": "math1-2025",    // ID of the paper it belongs to
    "number": 1,                // Question number
    "type": "choice",           // "choice" | "fill" | "answer"
    "tags": ["han-shu-ji-xian"],// Array of tag IDs (Natural Language)
    "contentImgThumb": "/papers/math1-2025/assets/01_q_thumb.png", // [New] Thumbnail path
    "year": 2025,
    "subject": "math",
    "category": "math1"
  },
  ...
]
```

### 2. `tags.json`
Defines the hierarchical knowledge tree.

**Schema:**
```json
[
  {
    "id": "gao-deng-shu-xue",
    "name": "高等数学",
    "parentId": null
  },
  {
    "id": "han-shu-ji-xian-lian-xu",
    "name": "函数、极限、连续",
    "parentId": "gao-deng-shu-xue"
  },
  ...
]
```

### 3. `paperGroups.json`
Defines the classification of exam subjects (Unified vs. Self-Proposed).

**Schema:**
```json
[
  {
    "id": "math1",
    "name": "数学一",
    "type": "unified",      // "unified" | "self_proposed"
    "subjectKey": "math"    // "math" | "english" | "politics" | "cs" | "other"
  },
  {
    "id": "shu-812",
    "name": "上海大学 812",
    "type": "self_proposed",
    "university": "上海大学",
    "courseCode": "812",
    "subjectKey": "cs"
  }
]
```

### 4. `papers/[paperId]/index.json`
Loaded lazily when a user selects a specific paper.

**Schema:**
```json
{
  "paperId": "math1-2025",
  "subjectKey": "math",   // [Optional] Force specific subject knowledge tree, e.g. "math"
  "year": "2025",
  "tags": [               // [New] Aggregated tags for the entire paper
    "han-shu-ji-xian",
    "wei-fen-xue"
  ],
  "questions": {
    "math1-2025-01": {
      "id": "math1-2025-01",
      "paperId": "math1-2025",
      "number": 1,
      "type": "choice",
      "tags": ["han-shu-ji-xian"],
      "score": 5,
      "videoUrl": "https://...",
      "contentImg": "/papers/math1-2025/assets/01_q.png",
      "answerImg": "/papers/math1-2025/assets/01_ans.png",
      "analysisImg": "/papers/math1-2025/assets/01_a.png",
      "contentMd": "",            // Markdown fallback
      "answerMd": "",
      "analysisMd": "",
      "answer": "B",
      "eureka": {           // [New] Interactive Cognitive Scaffolding
        "diagnostic": {
          "question": "你觉得卡在哪里了？",
          "options": [
            {
              "type": "representation",
              "label": "看不出该用什么方法",
              "hint": "这道题的关键是识别出它是周期函数。周期函数的特征方程必须有纯虚根。"
            },
            {
              "type": "constraint",
              "label": "不知道如何处理约束条件",
              "hint": "回到定义：什么样的函数是周期函数？sin(x) 和 cos(x)！它们来自哪里？"
            }
          ]
        },
        "modelLineup": {
          "question": "下面哪个模型的结构和这道题最像？",
          "options": [
            {
              "id": "geometric",
              "label": "几何级数",
              "formula": "∑ aⁿ",
              "isCorrect": false,
              "feedback": "不对。这道题分母有阶乘，不是几何级数。"
            },
            {
              "id": "taylor",
              "label": "泰勒展开 (sin/cos)",
              "formula": "∑ xⁿ/n!",
              "isCorrect": true,
              "feedback": "正确！分子的 2n 和分母的 (2n+1)! 提示你这是 sin 或 cos 的变体。"
            }
          ]
        },
        "variableRoles": [
          {
            "target": "(x-1)",
            "currentRole": "看作减法运算",
            "suggestedRole": "看作整体变量 X",
            "transformation": "令 X = x-1，整个方程变成 dX/dy = f(X, y)"
          }
        ],
        "insight": "原来不需要背冷门结论，只要回到 sin/cos 的来源（二阶常系数齐次线性微分方程的特征根）就能推出来！"
      }
    },
    ...
  }
}
```

## 📝 Text Formatting Rules

To ensure consistent rendering across the frontend application (specifically with `QuestionRenderer.tsx`), please adhere to the following Markdown and LaTeX rules in `contentMd`, `answerMd`, and `analysisMd`:

### 1. LaTeX Math Delimiters
- **Inline Math**: MUST be wrapped in single dollar signs `$...$`.
  - ✅ Correct: `$\cos x$`
  - ❌ Incorrect: `\cos x`, `\\(\cos x\\)`
- **Block Math**: MUST be wrapped in double dollar signs `$$...$$`.
  - ✅ Correct:
    ```markdown
    $$
    \int_0^1 x dx
    $$
    ```
  - ❌ Incorrect: `\[\int_0^1 x dx\]`

### 2. Mixed Content
- When mixing text and math, ensure math is strictly delimited.
  - ✅ Correct: `(1) $a=\frac{6}{7}$; (2) 不独立`
  - ❌ Incorrect: `(1) a=\frac{6}{7}; (2) 不独立`

### 3. Analysis Structure
- Use a **numbered list** for main steps.
- Use **bold titles** for step headers.
  - ✅ Correct:
    ```markdown
    1. **Step Title**:
       Description...
    ```

## 🚀 How to Deploy

1. **Push to GitHub**: Push this folder structure to your repository.
2. **Configure App**: Set the "Repository Source" in your app to the root of this repo (e.g., `https://raw.githubusercontent.com/Tinnci/tabularpractice-data/main`).
