import { Tree } from '@angular-devkit/schematics';
import * as fs from 'fs';
import * as path from 'path';

export interface ManifestComponentEntry {
    files: string[];
    deps: string[];
    externalDependencies: string[];
}
export interface ComponentManifest {
    version: string;
    components: Record<string, ManifestComponentEntry>;
    groups: Record<string, string[]>;
    externalDependencyVersions: Record<string, string>;
}

export function loadManifest(tree?: Tree): ComponentManifest {
    const manifestPath = '/schematics/add-component/files/component-manifest.json';
    let buffer = tree?.read(manifestPath);
    if (!buffer) {
        // Fallback: try resolving from installed package location.
        try {
            // __dirname when compiled (CommonJS) will be dist/practices-ui-tailwind/schematics/_utils
            // Navigate to add-component/files location.
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const path = require('path');
            const fs = require('fs');
            const candidate = path.resolve(__dirname, '..', 'add-component', 'files', 'component-manifest.json');
            if (fs.existsSync(candidate)) {
                buffer = fs.readFileSync(candidate);
            }
        } catch {
            /* ignore */
        }
    }
    if (!buffer) throw new Error('Manifest not found at ' + manifestPath);
    const parsed = JSON.parse(buffer.toString('utf8')) as Partial<ComponentManifest> & {
        components: Record<string, Partial<ManifestComponentEntry>>;
    };

    // Backward compatibility defaults
    Object.values(parsed.components || {}).forEach((c) => {
        if (!Array.isArray(c.externalDependencies)) c.externalDependencies = [];
    });
    if (!parsed.externalDependencyVersions) parsed.externalDependencyVersions = {};

    return parsed as ComponentManifest;
}

export interface LibraryPackageJson {
    version?: string;
    peerDependencies?: Record<string, string>;
    dependencies?: Record<string, string>;
}

/** package.json of the installed `@nexplore/practices-ui-tailwind` package (two levels above the compiled schematics). */
export function readLibraryPackageJson(): LibraryPackageJson {
    try {
        const pkgPath = path.resolve(__dirname, '..', '..', 'package.json');
        return JSON.parse(fs.readFileSync(pkgPath, 'utf8')) as LibraryPackageJson;
    } catch {
        return {};
    }
}

/**
 * Version range to use for an external dependency of a copied component.
 *
 * The manifest only lists the names (the version is `?`, it is not known when the manifest is generated), the version
 * is taken from the package.json of the library that is being installed. Returns undefined if it cannot be determined,
 * a placeholder such as `?` or an unreplaced `0.0.0-VERSION` must never be written into a package.json.
 */
export function resolveExternalDependencyVersion(
    manifest: ComponentManifest,
    dep: string,
    libraryPackageJson: LibraryPackageJson = readLibraryPackageJson(),
): string | undefined {
    const isUsable = (v: string | undefined): v is string => !!v && v !== '?' && !v.includes('VERSION');
    const fromManifest = manifest.externalDependencyVersions?.[dep];
    if (isUsable(fromManifest)) return fromManifest;
    const fromLibrary = libraryPackageJson.peerDependencies?.[dep] ?? libraryPackageJson.dependencies?.[dep];
    return isUsable(fromLibrary) ? fromLibrary : undefined;
}

export interface SelectionOptions {
    all?: boolean;
    names?: string;
    moduleExports?: string;
}

export function resolveSelectedComponents(manifest: ComponentManifest, opts: SelectionOptions): string[] {
    let base: Set<string> = new Set();
    if (opts.all) {
        base = new Set(Object.keys(manifest.components));
    } else if (opts.moduleExports) {
        const groups = opts.moduleExports
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);
        groups.forEach((g) => manifest.groups[g]?.forEach((c) => base.add(c)));
    } else if (opts.names) {
        opts.names
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
            .forEach((n) => base.add(n));
    }
    // include transitive deps
    const resolved = new Set<string>();
    const visit = (c: string) => {
        if (resolved.has(c)) return;
        if (!manifest.components[c]) return; // silently ignore unknown
        resolved.add(c);
        manifest.components[c].deps.forEach((d) => visit(d));
    };
    base.forEach((c) => visit(c));
    return Array.from(resolved).sort();
}

