# Tags 多科目扩展方案分析

## 📊 当前实现分析

### 现状

```
tags.json (单文件，所有科目混在一起)
    │
    ├── advanced-math (高等数学)
    │   ├── limit-calculation
    │   └── ...47个子标签
    │
    ├── linear-algebra (线性代数)
    │   └── ...12个子标签
    │
    └── probability-statistics (概率统计)
        └── ...12个子标签
```

### 当前代码硬编码问题

```typescript
// useTags.ts 第73-77行
const SUBJECT_ROOTS: Record<string, string[]> = {
    math: ['advanced-math', 'linear-algebra', 'probability-statistics'],
    english: ['vocabulary-grammar', 'reading-comprehension', 'cloze-test', 'writing'],
    politics: ['marxism', 'mao-theory', 'modern-history', 'morality-law', 'current-affairs']
};
```

**问题**：
1. ❌ 硬编码在代码中，添加新科目需要改代码
2. ❌ 所有科目标签混在一个文件，随着科目增多会变得臃肿
3. ❌ 科目配置分散在多处（代码 + 数据）

---

## 🎯 三个扩展方案对比

### 方案 A：数据驱动 + 单文件（推荐 ⭐⭐⭐）

**核心思想**：在 tags.json 中增加 `subjectKey` 字段，让数据自描述

```json
// tags.json
[
  {
    "id": "advanced-math",
    "name": "高等数学",
    "parentId": null,
    "subjectKey": "math",    // 新增：标识所属科目
    "isRoot": true           // 新增：标识为顶级分类
  },
  {
    "id": "limit-calculation",
    "name": "函数极限的计算",
    "parentId": "advanced-math"
    // 子标签不需要 subjectKey，继承父级
  }
]
```

**代码改动**：
```typescript
// useTags.ts - 移除硬编码
const getRootsForSubject = (subjectKey: string) => {
  return tagTree.filter(node => 
    flatTags?.find(t => t.id === node.id)?.subjectKey === subjectKey
  );
};
```

| 优点 | 缺点 |
|------|------|
| ✅ 零代码改动即可添加新科目 | ⚠️ 单文件可能变大 |
| ✅ 数据自描述，易理解 | ⚠️ 需要迁移现有数据 |
| ✅ 向后兼容 | |

---

### 方案 B：多文件分离

**核心思想**：每个科目一个独立的 tags 文件

```
data/
├── tags/
│   ├── math.json        # 数学标签
│   ├── english.json     # 英语标签
│   └── politics.json    # 政治标签
└── subjects.json        # 科目元数据
```

```json
// subjects.json
{
  "subjects": [
    { "key": "math", "name": "数学", "tagsFile": "tags/math.json" },
    { "key": "english", "name": "英语", "tagsFile": "tags/english.json" }
  ]
}
```

```json
// tags/math.json
{
  "subjectKey": "math",
  "roots": [
    {
      "id": "advanced-math",
      "name": "高等数学",
      "children": [
        { "id": "limit-calculation", "name": "函数极限的计算" }
      ]
    }
  ]
}
```

| 优点 | 缺点 |
|------|------|
| ✅ 文件分离，职责清晰 | ❌ 需要多次网络请求 |
| ✅ 可按需加载 | ❌ 改动较大 |
| ✅ 团队协作友好（减少冲突） | ❌ 数据结构变化大 |

---

### 方案 C：配置文件 + 单数据文件（折中方案）

**核心思想**：保持 tags.json 不变，新增 subjects.json 配置科目与根节点的映射

```json
// subjects.json (新增)
{
  "subjects": {
    "math": {
      "name": "数学",
      "roots": ["advanced-math", "linear-algebra", "probability-statistics"]
    },
    "english": {
      "name": "英语",
      "roots": ["vocabulary-grammar", "reading-comprehension", "cloze-test", "writing"]
    }
  }
}
```

```typescript
// useTags.ts - 改为从配置读取
const { data: subjectsConfig } = useSWR('subjects-config', fetchSubjectsConfig);

const getRootsForSubject = (subjectKey: string) => {
  const allowedRoots = subjectsConfig?.subjects[subjectKey]?.roots || [];
  return tagTree.filter(node => allowedRoots.includes(node.id));
};
```

| 优点 | 缺点 |
|------|------|
| ✅ 改动最小 | ⚠️ 配置与数据分离，需保持同步 |
| ✅ 配置集中管理 | ⚠️ 多一个文件需要维护 |
| ✅ 向后兼容 | |

---

## 📋 方案对比总结

| 维度 | 方案 A | 方案 B | 方案 C |
|------|--------|--------|--------|
| **改动成本** | 中 | 高 | 低 |
| **扩展性** | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| **维护性** | ⭐⭐⭐ | ⭐⭐ | ⭐⭐ |
| **性能** | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ |
| **数据一致性** | ⭐⭐⭐ | ⭐⭐ | ⭐⭐ |

---

## 🏆 推荐方案：方案 A（数据驱动 + 单文件）

### 推荐理由

1. **数据自描述**：新增科目只需添加数据，无需改代码
2. **单一数据源**：减少同步问题
3. **向后兼容**：现有代码改动小
4. **性能好**：单次请求加载所有标签

### 实施步骤

#### Step 1: 扩展 FlatTag 类型
```typescript
// useTags.ts
export interface FlatTag {
    id: string;
    name: string;
    parentId: string | null;
    subjectKey?: string;  // 可选，仅根节点需要
    isRoot?: boolean;     // 可选，标识顶级分类
}
```

#### Step 2: 更新 tags.json 数据（仅根节点）
```json
{
  "id": "advanced-math",
  "name": "高等数学",
  "parentId": null,
  "subjectKey": "math",
  "isRoot": true
}
```

#### Step 3: 重构 getRootsForSubject
```typescript
const getRootsForSubject = (subjectKey: string) => {
  if (!data) return [];
  
  // 动态从数据中获取根节点
  const rootIds = data
    .filter(tag => tag.subjectKey === subjectKey && tag.isRoot)
    .map(tag => tag.id);
  
  return tagTree.filter(node => rootIds.includes(node.id));
};
```

#### Step 4: 移除硬编码
```typescript
// 删除 SUBJECT_ROOTS 常量
```

---

## 🚀 扩展新科目示例

以添加「英语」科目为例：

### 只需在 tags.json 添加：
```json
// 顶级分类
{ "id": "vocabulary-grammar", "name": "词汇语法", "parentId": null, "subjectKey": "english", "isRoot": true },
{ "id": "reading-comprehension", "name": "阅读理解", "parentId": null, "subjectKey": "english", "isRoot": true },

// 子标签
{ "id": "word-formation", "name": "构词法", "parentId": "vocabulary-grammar" },
{ "id": "main-idea", "name": "主旨大意题", "parentId": "reading-comprehension" }
```

### 零代码改动！🎉

侧边栏会自动：
1. 识别新的科目根节点
2. 构建正确的树形结构
3. 显示在对应科目的侧边栏中

---

## 📝 后续优化建议

1. **科目元数据**：可在 `index.json` 中定义科目名称、图标等
2. **懒加载**：当科目数量增多时，可按需加载特定科目的标签
3. **缓存策略**：使用 localStorage 缓存标签数据
4. **版本控制**：添加 `version` 字段支持增量更新
