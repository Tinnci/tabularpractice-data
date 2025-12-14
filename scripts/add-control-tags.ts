import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

const ROOT_DIR = process.cwd();

async function main() {
    const tagsPath = join(ROOT_DIR, 'tags.json');
    const content = await readFile(tagsPath, 'utf-8');
    const tags = JSON.parse(content);

    // 控制理论根标签
    const controlTheoryRoot = {
        id: 'control-theory',
        name: '自动控制原理',
        parentId: null,
        subjectKey: 'control-theory',
        isRoot: true
    };

    // 现代控制理论
    const modernControl = {
        id: 'modern-control',
        name: '现代控制理论',
        parentId: null,
        subjectKey: 'control-theory',
        isRoot: true
    };

    // 经典控制理论
    const classicalControl = {
        id: 'classical-control',
        name: '经典控制理论',
        parentId: null,
        subjectKey: 'control-theory',
        isRoot: true
    };

    // 现代控制子标签
    const modernControlTags = [
        { id: 'state-space', name: '状态空间模型', parentId: 'modern-control' },
        { id: 'linear-transformation', name: '线性变换', parentId: 'modern-control' },
        { id: 'canonical-form', name: '标准型（能控/能观/约当）', parentId: 'modern-control' },
        { id: 'state-transition-matrix', name: '状态转移矩阵', parentId: 'modern-control' },
        { id: 'controllability', name: '能控性', parentId: 'modern-control' },
        { id: 'observability', name: '能观性', parentId: 'modern-control' },
        { id: 'pole-placement', name: '极点配置', parentId: 'modern-control' },
        { id: 'state-observer', name: '状态观测器', parentId: 'modern-control' },
        { id: 'lyapunov-stability', name: '李雅普诺夫稳定性', parentId: 'modern-control' },
    ];

    // 经典控制子标签
    const classicalControlTags = [
        { id: 'transfer-function', name: '传递函数', parentId: 'classical-control' },
        { id: 'circuit-modeling', name: '电路建模', parentId: 'classical-control' },
        { id: 'root-locus', name: '根轨迹', parentId: 'classical-control' },
        { id: 'frequency-domain', name: '频域分析', parentId: 'classical-control' },
        { id: 'bode-plot', name: 'Bode图', parentId: 'classical-control' },
        { id: 'nyquist-plot', name: 'Nyquist图', parentId: 'classical-control' },
        { id: 'compensation', name: '串联校正', parentId: 'classical-control' },
        { id: 'discrete-system', name: '离散控制系统', parentId: 'classical-control' },
        { id: 'z-transform', name: 'Z变换', parentId: 'classical-control' },
        { id: 'stability-analysis', name: '稳定性分析', parentId: 'classical-control' },
        { id: 'steady-state-error', name: '稳态误差', parentId: 'classical-control' },
    ];

    // 合并所有新标签
    const newTags = [
        controlTheoryRoot,
        modernControl,
        classicalControl,
        ...modernControlTags,
        ...classicalControlTags
    ];

    // 检查并添加不存在的标签
    const existingIds = new Set(tags.map((t: any) => t.id));
    const tagsToAdd = newTags.filter(t => !existingIds.has(t.id));

    if (tagsToAdd.length === 0) {
        console.log('All control theory tags already exist.');
        return;
    }

    const updatedTags = [...tags, ...tagsToAdd];

    await writeFile(tagsPath, JSON.stringify(updatedTags, null, 2), 'utf-8');
    console.log(`Added ${tagsToAdd.length} new control theory tags.`);
}

main().catch(console.error);
