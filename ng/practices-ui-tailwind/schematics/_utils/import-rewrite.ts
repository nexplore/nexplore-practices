import { dirname, relative, sep } from 'path';

export interface ImportRewriteConfig {
    destRoot: string;
}

// Very lightweight import rewrite: adjust imports referencing @nexplore/practices-ui-tailwind/* to relative paths under destRoot
export function rewriteImports(filePath: string, content: string, cfg: ImportRewriteConfig): string {
    const lines = content.split(/\r?\n/);
    const newLines = lines.map((l) => {
        const match = l.match(/import\s+[^'";]+from\s+['"](@nexplore\/practices-ui-tailwind(?:\/[\w\-\/]+)?)['"];?/);
        if (!match) return l;
        const spec = match[1];
        const after = spec.replace('@nexplore/practices-ui-tailwind/', '');
        if (!after || after.startsWith('src/')) return l; // skip if ambiguous
        const parts = after.split('/').filter(Boolean);
        const compFolder = parts[0];
        // compute relative path
        const fromDir = dirname(filePath);
        const target = cfg.destRoot.endsWith('/') ? cfg.destRoot : cfg.destRoot + '/';
        const targetCompDir = target + compFolder;
        // naive: just compute relative path one level up assumption
        let rel = relative(fromDir, targetCompDir).split(sep).join('/');
        if (!rel.startsWith('.')) rel = './' + rel;
        const replaced = l.replace(spec, rel);
        return replaced;
    });
    return newLines.join('\n');
}

