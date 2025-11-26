# TabularPractice Data Repository Structure

This document describes the structure for the decoupled data repository.

## 📂 Directory Structure

```text
/
├── index.json            # [Required] The master index file
├── tags.json             # [Required] Knowledge tree structure
├── papers/               # [Required] Folder containing individual paper details
│   ├── math1-2025/       # Subdirectory for each paper
│   │   ├── index.json    # The paper's data file
│   │   └── assets/       # Images for this paper
│   │       ├── 01_q.png  # Question 1 Image
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
    "tags": ["13"],             // Array of tag IDs
    "year": 2025,
    "subject": "math",
    "category": "math1"
  },
  ...
]
```

### 2. `papers/[paperId]/index.json`
Loaded lazily when a user selects a specific paper.

**Schema:**
```json
{
  "paperId": "math1-2025",
  "year": "2025",
  "tags": [               // [New] Aggregated tags for the entire paper
    "han-shu-ji-xian",
    "wei-fen-xue"
  ],
  "questions": {
    "math1-2025-01": {
      "id": "math1-2025-01",
      "originalId": 665,          // ID from source
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
      "answer": "B"
    },
    ...
  }
}
```

## 🚀 How to Deploy

1. **Push to GitHub**: Push this folder structure to your repository.
2. **Configure App**: Set the "Repository Source" in your app to the root of this repo (e.g., `https://raw.githubusercontent.com/Tinnci/tabularpractice-data/main`).
