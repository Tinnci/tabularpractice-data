/**
 * Circuit Topology Parser
 * Converts intuitive topology descriptions into full circuit diagrams
 * 
 * Example syntax:
 * "vs(uᵢ) → r1(R₁) → [parallel: c1(C₁), r2(R₂)] → c2(C₂) → gnd"
 */

interface Position {
    x: number;
    y: number;
}

interface CircuitComponent {
    id: string;
    type: "resistor" | "capacitor" | "inductor" | "voltage-source" | "ground" | "node";
    label?: string;
    position: Position;
    rotation?: 0 | 90 | 180 | 270;
}

interface CircuitConnection {
    from: string;
    to: string;
    style?: "solid" | "dashed";
    bendPoints?: Position[];
}

interface CircuitDiagramConfig {
    components: CircuitComponent[];
    connections: CircuitConnection[];
    annotations?: Array<{ x: number; y: number; text: string }>;
    inputLabel?: string;
    outputLabel?: string;
}

const COMPONENT_TYPE_MAP: Record<string, CircuitComponent["type"]> = {
    vs: "voltage-source",
    r: "resistor",
    c: "capacitor",
    l: "inductor",
    gnd: "ground",
};

const GRID_SIZE = 40;
const VERTICAL_SPACING = 100;

/**
 * Parse topology string and generate circuit config
 * 
 * Syntax:
 * - Serial: "a → b → c"
 * - Parallel: "[parallel: a, b, c]"
 * - Component: "type(label)" e.g., "r1(R₁)"
 * 
 * Example:
 * ```
 * vs(uᵢ) → r1(R₁) → [parallel: c1(C₁), r2(R₂)] → c2(C₂) → gnd
 * ```
 */
export function parseCircuitTopology(topology: string): CircuitDiagramConfig {
    const components: CircuitComponent[] = [];
    const connections: CircuitConnection[] = [];

    let currentX = 0;
    let currentY = 100;
    let prevId: string | null = null;

    // Normalize whitespace
    topology = topology.replace(/\s+/g, " ").trim();

    // Split by arrows
    const parts = topology.split("→").map(s => s.trim());

    parts.forEach((part, partIndex) => {
        // Check if this is a parallel block
        if (part.startsWith("[parallel:")) {
            // Extract parallel components
            const innerContent = part.match(/\[parallel:\s*(.+?)\]/)?.[1];
            if (!innerContent) {
                throw new Error(`Invalid parallel syntax: ${part}`);
            }

            const parallelParts = innerContent.split(",").map(s => s.trim());
            const parallelIds: string[] = [];
            const branchStartX = currentX;

            // Create junction node before parallel
            const junctionId = `junction_${partIndex}`;
            components.push({
                id: junctionId,
                type: "node",
                position: { x: branchStartX, y: currentY },
            });

            if (prevId) connections.push({ from: prevId, to: junctionId });

            // Create parallel branches
            parallelParts.forEach((parallelPart, branchIndex) => {
                const branchY = currentY + (branchIndex - parallelParts.length / 2 + 0.5) * VERTICAL_SPACING;
                const { id, component } = parseComponent(parallelPart, branchStartX + GRID_SIZE * 2, branchY);
                components.push(component);
                parallelIds.push(id);

                // Connect from junction
                connections.push({ from: junctionId, to: id });
            });

            // Create junction node after parallel
            const mergeId = `merge_${partIndex}`;
            currentX = branchStartX + GRID_SIZE * 4;
            components.push({
                id: mergeId,
                type: "node",
                position: { x: currentX, y: currentY },
            });

            // Connect to merge point
            parallelIds.forEach(id => {
                connections.push({ from: id, to: mergeId });
            });

            prevId = mergeId;
            currentX += GRID_SIZE * 2;
        } else {
            // Single component
            const { id, component } = parseComponent(part, currentX, currentY);
            components.push(component);

            if (prevId) {
                connections.push({ from: prevId, to: id });
            }

            prevId = id;
            currentX += GRID_SIZE * 2;
        }
    });

    return {
        components,
        connections,
        inputLabel: components[0]?.label,
        outputLabel: components[components.length - 1]?.label,
    };
}

/**
 * Parse a single component definition
 * Format: "id(label)" or "id"
 * Example: "r1(R₁)", "vs(uᵢ)", "gnd"
 */
function parseComponent(
    def: string,
    x: number,
    y: number
): { id: string; component: CircuitComponent } {
    const match = def.match(/^([a-z0-9]+)(?:\((.+?)\))?$/);
    if (!match || !match[1]) {
        throw new Error(`Invalid component definition: ${def}`);
    }

    const rawId = match[1];
    const label = match[2];

    // Determine component type from ID prefix
    const typePrefix = rawId.replace(/[0-9]+$/, ""); // Remove trailing numbers
    const type = COMPONENT_TYPE_MAP[typePrefix];

    if (!type) {
        throw new Error(`Unknown component type prefix: ${typePrefix} in ${def}`);
    }

    const component: CircuitComponent = {
        id: rawId,
        type,
        label: label || undefined,
        position: { x, y },
        rotation: type === "capacitor" ? 90 : 0, // Capacitors vertical by default
    };

    return { id: rawId, component };
}

/**
 * Convert topology string to full visualization config
 */
export function topologyToVizConfig(
    topology: string,
    title?: string
): { type: "circuit-diagram"; title?: string; config: CircuitDiagramConfig } {
    const config = parseCircuitTopology(topology);
    return {
        type: "circuit-diagram",
        title,
        config,
    };
}

// --- CLI for testing ---
if (import.meta.main) {
    const testTopology = process.argv[2] || "vs(uᵢ) → r1(R₁) → [parallel: c1(C₁), r2(R₂)] → c2(C₂) → gnd";

    console.log("Input topology:");
    console.log(testTopology);
    console.log("\nGenerated config:");
    console.log(JSON.stringify(topologyToVizConfig(testTopology, "Test Circuit"), null, 2));
}
