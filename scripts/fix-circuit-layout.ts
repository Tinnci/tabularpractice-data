/**
 * Auto-fix circuit diagram configurations
 * - Snaps all positions to grid (20px)
 * - Removes unnecessary bendPoints
 */

import { resolve, join } from "path";
import { readFile, writeFile } from "fs/promises";

const GRID_SIZE = 20;

function snapToGrid(value: number): number {
    return Math.round(value / GRID_SIZE) * GRID_SIZE;
}

interface Position {
    x: number;
    y: number;
}

interface CircuitComponent {
    id: string;
    type: string;
    label?: string;
    position: Position;
    rotation?: number;
}

interface CircuitConnection {
    from: string;
    to: string;
    style?: string;
    bendPoints?: Position[];
}

interface CircuitConfig {
    components: CircuitComponent[];
    connections: CircuitConnection[];
    annotations?: Array<{ x: number; y: number; text: string }>;
    inputLabel?: string;
    outputLabel?: string;
}

interface VisualizationConfig {
    type: string;
    title?: string;
    config: CircuitConfig;
}

interface Question {
    eureka?: {
        visualization?: VisualizationConfig;
    };
}

async function fixCircuitLayout(paperPath: string) {
    const indexPath = join(paperPath, "index.json");

    console.log(`📖 Reading ${indexPath}...`);
    const content = await readFile(indexPath, "utf-8");
    const data = JSON.parse(content);

    let fixCount = 0;
    let snapCount = 0;
    let bendPointsRemoved = 0;

    // Process each question
    for (const questionId of Object.keys(data.questions)) {
        const question: Question = data.questions[questionId];

        if (question.eureka?.visualization?.type === "circuit-diagram") {
            const viz = question.eureka.visualization;
            const config = viz.config as CircuitConfig;

            console.log(`\n🔧 Processing ${questionId}...`);

            // Fix component positions
            if (config.components) {
                config.components.forEach((comp) => {
                    const oldX = comp.position.x;
                    const oldY = comp.position.y;
                    const newX = snapToGrid(oldX);
                    const newY = snapToGrid(oldY);

                    if (oldX !== newX || oldY !== newY) {
                        console.log(`  📍 ${comp.id}: (${oldX}, ${oldY}) → (${newX}, ${newY})`);
                        comp.position.x = newX;
                        comp.position.y = newY;
                        snapCount++;
                    }
                });
            }

            // Fix annotations
            if (config.annotations) {
                config.annotations.forEach((ann) => {
                    const oldX = ann.x;
                    const oldY = ann.y;
                    const newX = snapToGrid(oldX);
                    const newY = snapToGrid(oldY);

                    if (oldX !== newX || oldY !== newY) {
                        ann.x = newX;
                        ann.y = newY;
                        snapCount++;
                    }
                });
            }

            // Analyze and potentially remove bendPoints
            if (config.connections) {
                config.connections.forEach((conn, idx) => {
                    if (conn.bendPoints && conn.bendPoints.length > 0) {
                        // Snap bendPoints to grid
                        conn.bendPoints = conn.bendPoints.map(bp => ({
                            x: snapToGrid(bp.x),
                            y: snapToGrid(bp.y)
                        }));

                        // Check if bend points are necessary
                        // If bendPoints are collinear with start/end, we can remove them
                        // For now, just log them for manual review
                        console.log(`  🔗 Connection ${idx} (${conn.from} → ${conn.to}) has ${conn.bendPoints.length} bend points`);

                        // Optional: Remove bendPoints that are redundant
                        // This is commented out for safety - enable after testing
                        // delete conn.bendPoints;
                        // bendPointsRemoved++;
                    }
                });
            }

            fixCount++;
        }
    }

    if (snapCount > 0 || bendPointsRemoved > 0) {
        console.log(`\n✅ Fixed ${fixCount} circuit diagrams:`);
        console.log(`   📍 Snapped ${snapCount} positions to grid`);
        console.log(`   🔗 Removed ${bendPointsRemoved} unnecessary bend points`);

        // Write back
        await writeFile(indexPath, JSON.stringify(data, null, 2), "utf-8");
        console.log(`\n💾 Saved to ${indexPath}`);
    } else {
        console.log(`\n✨ No changes needed - all circuits are already optimized!`);
    }
}

// Main
const papersDir = resolve(__dirname, "..", "papers");
const targetPaper = process.argv[2] || "shu-836-2025";

fixCircuitLayout(join(papersDir, targetPaper))
    .then(() => console.log("\n🎉 Done!"))
    .catch((err) => {
        console.error("❌ Error:", err);
        process.exit(1);
    });
