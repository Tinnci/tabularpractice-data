# 控制理论可视化设计方案

## 一、2025年上海大学836考题涉及的图形类型

### 1. 电路原理图 (Circuit Diagram) - 第6题
**图的内容**：
- RC无源网络电路，含电阻 $R_1, R_2$ 和电容 $C_1, C_2$
- 标注输入电压 $u_i(t)$ 和输出电压 $u_o(t)$
- 二阶系统拓扑结构

**技术方案**：
```typescript
interface CircuitDiagramConfig {
    type: "circuit-diagram";
    components: Array<{
        type: "resistor" | "capacitor" | "inductor" | "voltage-source" | "ground" | "wire";
        id: string;
        label?: string;
        value?: string;  // e.g., "R_1", "10kΩ"
        position: { x: number; y: number };
        rotation?: 0 | 90 | 180 | 270;
    }>;
    connections: Array<{
        from: string;
        to: string;
        style?: "solid" | "dashed";
    }>;
    annotations?: Array<{
        x: number;
        y: number;
        text: string;  // LaTeX supported
    }>;
}
```

**渲染库选择**：
- 方案A：使用 **SVG 手绘组件** - 自定义React组件
- 方案B：使用 **react-flow** 或 **xyflow** 进行节点连线
- 方案C：集成 **CircuitJS** 或类似工具

---

### 2. 单位阶跃响应曲线 (Step Response) - 第8题
**图的内容**：
- 横轴：时间 $t$
- 纵轴：输出响应 $c(t)$
- 曲线形状：$c(t) = 1 - e^{-t/T}$ （一阶响应）
- 标注关键点：稳态值、时间常数 $T$

**技术方案**：
```typescript
interface StepResponseConfig {
    type: "step-response";
    systemType: "first-order" | "second-order" | "custom";
    // 一阶系统参数
    timeConstant?: number;        // T
    gain?: number;                // K
    // 二阶系统参数
    dampingRatio?: number;        // ζ
    naturalFrequency?: number;    // ωn
    // 自定义表达式
    customExpression?: string;    // e.g., "1 - exp(-t/2)"
    tRange: [number, number];
    annotations?: Array<{
        type: "steady-state" | "settling-time" | "rise-time" | "overshoot" | "custom";
        value?: number;
        label?: string;
    }>;
}
```

**渲染实现**：
- 使用现有的 `EnhancedFunctionPlot` 组件
- 添加控制理论特定的标注（稳态值线、时间常数点等）

---

### 3. 离散系统方框图 (Block Diagram) - 第9题
**图的内容**：
- 多个传递函数方块：$G_1(s), G_2(s), G_3(s), G_4(s), H(s)$
- 求和点（summing junction）
- 采样开关（sampler）符号
- 零阶保持器（ZOH）
- 信号流向箭头

**技术方案**：
```typescript
interface BlockDiagramConfig {
    type: "block-diagram";
    blocks: Array<{
        id: string;
        type: "transfer-function" | "summing-junction" | "sampler" | "zoh" | "gain";
        label?: string;           // e.g., "G_1(s)", "+", "-"
        position: { x: number; y: number };
        size?: { width: number; height: number };
    }>;
    connections: Array<{
        from: string;
        to: string;
        fromPort?: "right" | "bottom";
        toPort?: "left" | "top";
        signalType?: "continuous" | "discrete";
        sign?: "+" | "-";
        label?: string;           // e.g., "R(s)", "C(z)"
    }>;
    feedbackLoops?: Array<{
        from: string;
        to: string;
        type: "positive" | "negative";
    }>;
}
```

**渲染库选择**：
- 方案A：**react-flow / xyflow** - 强大的节点编辑器
- 方案B：自定义SVG组件配合 **dagre** 自动布局
- 方案C：使用 **mermaid** 的流程图语法

---

### 4. 根轨迹图 (Root Locus) - 第7题
**图的内容**：
- 复平面（实轴 + 虚轴）
- 开环极点（×）和零点（○）
- 根轨迹曲线（实轴段 + 分支）
- 渐近线
- 分离点/会合点
- 虚轴交点
- 箭头指示增益增加方向

**技术方案**：
```typescript
interface RootLocusConfig {
    type: "root-locus";
    openLoopPoles: Array<{ re: number; im: number }>;
    openLoopZeros: Array<{ re: number; im: number }>;
    // 自动计算或手动指定
    asymptotes?: {
        angles: number[];         // 渐近线角度
        centroid: number;         // 重心位置
    };
    separationPoints?: Array<{ re: number; im: number }>;
    imaginaryAxisCrossings?: Array<{ im: number; k: number }>;  // 虚轴交点及对应K值
    branches?: Array<{
        points: Array<{ re: number; im: number }>;
        kValues?: number[];
    }>;
    kRange?: [number, number];
    realAxisRange?: [number, number];
    imagAxisRange?: [number, number];
}
```

**渲染实现**：
- 扩展现有的 `Viz2DContainer` + 自定义复平面坐标系
- 使用 **Mafs** 库绘制曲线和标注
- 添加交互：鼠标悬停显示K值

---

### 5. Bode图 (Bode Plot) - 第8题
**图的内容**：
- **幅频特性图**：横轴 $\log\omega$，纵轴 $20\lg|G(j\omega)|$ (dB)
- **相频特性图**：横轴 $\log\omega$，纵轴 $\angle G(j\omega)$ (度)
- 渐近线绘制
- 转折频率标注
- 截止频率和相角裕度标注

**技术方案**：
```typescript
interface BodePlotConfig {
    type: "bode-plot";
    transferFunction: {
        // 零极点形式
        zeros?: Array<{ value: number; multiplicity?: number }>;
        poles?: Array<{ value: number; multiplicity?: number }>;
        gain?: number;
        // 或表达式形式
        numerator?: string;       // e.g., "s + 1"
        denominator?: string;     // e.g., "s * (0.1*s + 1)"
    };
    omegaRange: [number, number]; // 对数范围
    showAsymptotes?: boolean;
    showPhaseMargin?: boolean;
    showGainMargin?: boolean;
    annotations?: Array<{
        type: "crossover-frequency" | "phase-margin" | "gain-margin" | "corner-frequency";
        value?: number;
        label?: string;
    }>;
}
```

**渲染实现**：
- 双子图布局（幅频 + 相频）
- 使用 `EnhancedFunctionPlot` 的扩展版本
- 对数坐标支持

---

### 6. Nyquist图 (Nyquist Plot) - 备用
**图的内容**：
- 复平面极坐标表示
- $G(j\omega)$ 轨迹曲线
- 频率标注
- 临界点 $(-1, 0)$

**技术方案**：
```typescript
interface NyquistPlotConfig {
    type: "nyquist-plot";
    transferFunction: {
        numerator: string;
        denominator: string;
    };
    omegaRange: [number, number];
    showCriticalPoint?: boolean;  // (-1, 0)
    showUnitCircle?: boolean;
    frequencyMarkers?: number[];  // 在曲线上标注的频率点
}
```

---

## 二、实现架构

### 目录结构
```
src/components/question/ui/ControlVisualization/
├── index.tsx                    # 统一导出
├── types.ts                     # 类型定义
├── ControlVisualizationRenderer.tsx  # 主渲染器
├── CircuitDiagram/
│   ├── CircuitDiagram.tsx
│   ├── components/              # 电阻、电容等符号组件
│   └── utils.ts
├── BlockDiagram/
│   ├── BlockDiagram.tsx
│   ├── nodes/                   # 各种节点类型
│   └── edges/                   # 连接线类型
├── RootLocus/
│   ├── RootLocus.tsx
│   └── calculations.ts          # 根轨迹计算
├── BodePlot/
│   ├── BodePlot.tsx
│   └── asymptotes.ts            # 渐近线计算
├── StepResponse/
│   ├── StepResponse.tsx
│   └── systems.ts               # 系统响应计算
└── NyquistPlot/
    └── NyquistPlot.tsx
```

### 数据模型扩展
在 `Question` 类型中添加可视化配置：

```typescript
// 在 eureka 中添加 visualization 字段
interface EurekaData {
    // ... 现有字段
    visualization?: ControlVisualizationConfig | VisualizationConfig;
}

// 或者在题目内容中嵌入
interface Question {
    // ... 现有字段
    visualizations?: Array<{
        id: string;
        context: "content" | "answer" | "analysis" | "eureka";
        config: ControlVisualizationConfig;
    }>;
}
```

### Markdown渲染器集成
扩展现有的Markdown渲染器，支持特殊语法：

```markdown
<!-- 嵌入方框图 -->
:::control-viz{type="block-diagram" id="discrete-system-q9"}

<!-- 嵌入根轨迹 -->
:::control-viz{type="root-locus" id="rl-q7"}
```

---

## 三、技术选型建议

| 图形类型 | 推荐方案 | 备选方案 |
|---------|---------|---------|
| 电路图 | 自定义SVG组件 | react-flow |
| 方框图 | react-flow/xyflow | 自定义SVG + dagre |
| 根轨迹 | Mafs (扩展) | D3.js |
| Bode图 | Mafs (扩展) | Plotly |
| 阶跃响应 | 现有EnhancedFunctionPlot | - |
| Nyquist图 | Mafs (扩展) | D3.js |

---

## 四、实现优先级

1. **Phase 1** (高优先级 - 核心显示)
   - StepResponse: 扩展现有FunctionPlot
   - BodePlot: 双子图布局
   
2. **Phase 2** (中优先级 - 结构图)
   - BlockDiagram: 使用react-flow
   - CircuitDiagram: 自定义SVG组件

3. **Phase 3** (可选 - 高级可视化)
   - RootLocus: 复平面交互图
   - NyquistPlot: 极坐标图

---

## 五、示例数据

### Q6 电路图配置示例
```json
{
    "type": "circuit-diagram",
    "components": [
        {"id": "vs", "type": "voltage-source", "label": "u_i", "position": {"x": 0, "y": 100}},
        {"id": "r1", "type": "resistor", "label": "R_1", "position": {"x": 100, "y": 50}},
        {"id": "c1", "type": "capacitor", "label": "C_1", "position": {"x": 100, "y": 150}},
        {"id": "r2", "type": "resistor", "label": "R_2", "position": {"x": 200, "y": 50}},
        {"id": "c2", "type": "capacitor", "label": "C_2", "position": {"x": 200, "y": 150}},
        {"id": "gnd", "type": "ground", "position": {"x": 100, "y": 200}}
    ],
    "connections": [
        {"from": "vs", "to": "r1"},
        {"from": "r1", "to": "c1"},
        {"from": "c1", "to": "r2"},
        {"from": "r2", "to": "c2"}
    ],
    "annotations": [
        {"x": 250, "y": 100, "text": "$u_o(t)$"}
    ]
}
```

### Q9 方框图配置示例
```json
{
    "type": "block-diagram",
    "blocks": [
        {"id": "r", "type": "input", "label": "R(s)", "position": {"x": 0, "y": 100}},
        {"id": "sum1", "type": "summing-junction", "position": {"x": 100, "y": 100}},
        {"id": "sampler1", "type": "sampler", "position": {"x": 150, "y": 100}},
        {"id": "zoh", "type": "zoh", "label": "ZOH", "position": {"x": 200, "y": 100}},
        {"id": "g1", "type": "transfer-function", "label": "G_1(s)", "position": {"x": 300, "y": 100}},
        {"id": "g2", "type": "transfer-function", "label": "G_2(s)", "position": {"x": 400, "y": 100}},
        {"id": "g3", "type": "transfer-function", "label": "G_3(s)", "position": {"x": 500, "y": 100}},
        {"id": "sampler2", "type": "sampler", "position": {"x": 550, "y": 100}},
        {"id": "c", "type": "output", "label": "C(z)", "position": {"x": 600, "y": 100}},
        {"id": "h", "type": "transfer-function", "label": "H(s)", "position": {"x": 300, "y": 200}},
        {"id": "g4", "type": "transfer-function", "label": "G_4(s)", "position": {"x": 400, "y": 50}}
    ],
    "connections": [
        {"from": "r", "to": "sum1", "label": "R(s)"},
        {"from": "sum1", "to": "sampler1"},
        {"from": "sampler1", "to": "zoh"},
        {"from": "zoh", "to": "g1"},
        {"from": "g1", "to": "g2"},
        {"from": "g2", "to": "g3"},
        {"from": "g3", "to": "sampler2"},
        {"from": "sampler2", "to": "c"},
        {"from": "g3", "to": "h", "fromPort": "bottom"},
        {"from": "h", "to": "sum1", "toPort": "bottom", "sign": "-"}
    ]
}
```

## 六、实施进度 (Implementation Status)

### 1. 核心可视化组件 (Core Components) - ✅ 已完成
位于 `src/components/question/ui/ControlVisualization/`：
- `ControlVisualizationRenderer`: 统一渲染入口
- `StepResponse`: 阶跃响应图 (Mafs)
- `BodePlot`: 伯德图 (Mafs)
- `RootLocus`: 根轨迹图 (Mafs)
- `BlockDiagram`: 方框图 (@xyflow/react)
- `CircuitDiagram`: 电路图 (SVG)

### 2. 真题数据集成 (Data Integration) - ✅ 已完成
- 更新 `shu-836-2025/index.json`
- Q6 (电路), Q7 (根轨迹), Q8 (Bode), Q9 (离散方框图) 已配置

### 3. 应用集成 (App Integration) - ✅ 已完成
- `QuestionContent.tsx` 已更新，智能识别 `eureka.visualization` 类型

### 4. Markdown 内嵌渲染 (Markdown Rendering) - ✅ 已完成
已在 `MarkdownContent.tsx` 中实现。
**使用方法**：使用 `control-viz` 语言代码块，并填入 JSON 配置对象。

````markdown
```control-viz
{
  "type": "step-response",
  "systemType": "second-order",
  "dampingRatio": 0.5,
  "naturalFrequency": 5,
  "tRange": [0, 5],
  "height": 300
}
```
````

组件导出已在 `src/components/question/ui/ControlVisualization/index.ts` 确认完成。

