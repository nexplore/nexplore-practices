const fg = require('fast-glob');
const fs = require('fs').promises;
const path = require('path');
const { Project, SyntaxKind } = require('ts-morph');

interface ManifestComponentEntry {
    files: string[];
    deps: string[];
    externalDependencies: string[];
}
interface Manifest {
    version: string;
    components: Record<string, ManifestComponentEntry>;
    groups: Record<string, string[]>;
    externalDependencyVersions?: Record<string, string>;
}

const MANIFEST_VERSION = '1.0.0';

async function main() {
    const root = path.resolve(__dirname, '..', '..');
    const libSrc = path.join(root, 'src', 'lib');

    const componentDirs = (await fg(['*/'], { cwd: libSrc, onlyDirectories: true })).map((d) => d.replace(/\/$/, ''));

    const project = new Project({ tsConfigFilePath: path.join(root, 'tsconfig.lib.json') });
    const dryRun = process.argv.includes('--dry-run');

    const components: Record<string, ManifestComponentEntry> = {};

    // Collect a superset of all external deps to later map to versions
    const allExternalDeps = new Set<string>();

    for (const dir of componentDirs) {
        const absDir = path.join(libSrc, dir);
        const filePaths = await fg(['**/*.ts', '**/*.html', '**/*.scss', '**/*.css'], { cwd: absDir });
        const files = filePaths
            .filter((f) => !f.endsWith('.spec.ts') && !f.endsWith('.story.ts'))
            .map((f) => path.join('src/lib', dir, f).replace(/\\/g, '/'));

        const deps = new Set<string>();
        const externalDeps = new Set<string>();
        for (const tsFile of filePaths.filter((f) => f.endsWith('.ts'))) {
            const sourceFile = project.addSourceFileAtPathIfExists(path.join(absDir, tsFile));
            if (!sourceFile) continue;
            sourceFile.getImportDeclarations().forEach((imp) => {
                const spec = imp.getModuleSpecifierValue();
                if (spec.startsWith('./') || spec.startsWith('../')) {
                    const resolved = path.normalize(path.join(path.dirname(path.join(absDir, tsFile)), spec));
                    const maybeComponent = componentDirs.find((c) => resolved.startsWith(path.join(libSrc, c)));
                    if (maybeComponent && maybeComponent !== dir) deps.add(maybeComponent);
                } else if (spec.startsWith('@nexplore/practices-ui-tailwind')) {
                    const after = spec.split('@nexplore/practices-ui-tailwind')[1];
                    const seg = after.split('/').filter(Boolean)[0];
                    if (seg && componentDirs.includes(seg) && seg !== dir) deps.add(seg);
                } else if (spec.startsWith('@nexplore/')) {
                    // Any other @nexplore/* package that is not this library counts as an external dependency
                    const segments = spec.split('/');
                    if (segments.length >= 2) {
                        const pkgName = segments.slice(0, 2).join('/'); // scope + package
                        if (pkgName !== '@nexplore/practices-ui-tailwind') {
                            externalDeps.add(pkgName);
                        }
                    }
                }
            });
        }

        const externalDependencies = Array.from(externalDeps).sort();
        externalDependencies.forEach((d) => allExternalDeps.add(d));
        components[dir] = {
            files,
            deps: Array.from(deps).sort(),
            externalDependencies,
        };
    }

    const groups: Record<string, string[]> = {};
    const moduleFiles = await fg(['**/*.module.ts'], { cwd: libSrc });
    for (const mf of moduleFiles) {
        const abs = path.join(libSrc, mf);
        const sf = project.addSourceFileAtPathIfExists(abs);
        if (!sf) continue;
        const ngModuleClasses = sf.getClasses().filter((c) => c.getDecorator('NgModule'));
        ngModuleClasses.forEach((cls) => {
            const dec = cls.getDecorator('NgModule');
            const arg = dec?.getArguments()[0];
            if (!arg || !arg.asKind(SyntaxKind.ObjectLiteralExpression)) return;
            const obj = arg.asKind(SyntaxKind.ObjectLiteralExpression);
            if (!obj) return;
            const exportsProp = obj.getProperty('exports');
            if (!exportsProp) return;
            let componentNames: string[] = [];
            const exportsPropAsAssignment = exportsProp.asKind(SyntaxKind.PropertyAssignment);
            if (exportsPropAsAssignment) {
                const init = exportsPropAsAssignment.getInitializer();
                const initArray = init?.asKind(SyntaxKind.ArrayLiteralExpression);
                if (initArray) {
                    componentNames = initArray
                        .getElements()
                        .map((e) => e.getText().replace(/\s/g, ''))
                        .filter((t) => !!t && !t.startsWith('['));
                }
            }
            const mapped = componentNames
                .map((n) =>
                    componentDirs.find(
                        (d) => d.toLowerCase() === n.replace(/Component|Directive|Pipe|Module$/, '').toLowerCase(),
                    ),
                )
                .filter((v): v is string => !!v);
            if (mapped.length) groups[cls.getName() || mf] = Array.from(new Set(mapped)).sort();
        });
    }

    const externalDependencyVersions: Record<string, string> = {};
    for (const dep of allExternalDeps) {
        // just add ?, as we will add the version at runtime
        externalDependencyVersions[dep] = '?';
    }
    const manifest: Manifest = { version: MANIFEST_VERSION, components, groups, externalDependencyVersions };
    const ngRoot = path.join(root, '..');
    const distOutDir = path.join(ngRoot, 'dist', 'practices-ui-tailwind', 'schematics', 'add-component', 'files');
    const outPath = path.join(distOutDir, 'component-manifest.json');
    if (dryRun) {
        console.log(
            '[generate-manifest] Dry-run: would write manifest with',
            Object.keys(components).length,
            'components and',
            Object.keys(groups).length,
            'groups to',
            outPath,
        );
        return;
    }
    await fs.mkdir(distOutDir, { recursive: true });
    await fs.writeFile(outPath, JSON.stringify(manifest, null, 2), 'utf8');
    console.log('Manifest written to', outPath);
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});

