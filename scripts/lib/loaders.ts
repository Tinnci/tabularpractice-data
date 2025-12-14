/**
 * Data loaders - Read existing configuration files
 */

import { readFile } from 'fs/promises';
import { join } from 'path';
import type { PaperGroup, Tag } from './types';

// Load paper groups from paperGroups.json
export async function loadPaperGroups(rootDir: string): Promise<PaperGroup[]> {
    const path = join(rootDir, 'paperGroups.json');
    const content = await readFile(path, 'utf-8');
    return JSON.parse(content);
}

// Load tags from tags.json
export async function loadTags(rootDir: string): Promise<Tag[]> {
    const path = join(rootDir, 'tags.json');
    const content = await readFile(path, 'utf-8');
    return JSON.parse(content);
}

// Extract unique subject keys from tags
export function extractSubjectKeys(tags: Tag[]): string[] {
    const subjectKeys = new Set<string>();

    for (const tag of tags) {
        if (tag.subjectKey && tag.isRoot) {
            subjectKeys.add(tag.subjectKey);
        }
    }

    return Array.from(subjectKeys);
}

// Get tags for a specific subject
export function getTagsForSubject(tags: Tag[], subjectKey: string): Tag[] {
    // Get all root tags for this subject
    const rootIds = new Set(
        tags.filter(t => t.subjectKey === subjectKey && t.isRoot).map(t => t.id)
    );

    // Get all child tags that belong to these roots
    return tags.filter(t => {
        if (t.subjectKey === subjectKey) return true;
        if (t.parentId && rootIds.has(t.parentId)) return true;
        // Check grandparent
        const parent = tags.find(p => p.id === t.parentId);
        if (parent && rootIds.has(parent.parentId || '')) return true;
        return false;
    });
}

// Check if a paper already exists
export async function paperExists(rootDir: string, paperId: string): Promise<boolean> {
    const { stat } = await import('fs/promises');
    const paperPath = join(rootDir, 'papers', paperId, 'index.json');

    try {
        await stat(paperPath);
        return true;
    } catch {
        return false;
    }
}

// Get existing paper IDs for a group
export async function getExistingPaperIdsForGroup(
    rootDir: string,
    groupId: string
): Promise<string[]> {
    const { readdir } = await import('fs/promises');
    const papersDir = join(rootDir, 'papers');

    try {
        const dirs = await readdir(papersDir);
        return dirs.filter(d => d.startsWith(groupId + '-') || d === groupId);
    } catch {
        return [];
    }
}
