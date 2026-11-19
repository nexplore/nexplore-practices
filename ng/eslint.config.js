const path = require('path');
const nx = require('@nx/eslint-plugin');
const rxjs = require('eslint-plugin-rxjs-x').default;
const tseslint = require('typescript-eslint');
const importX = require('eslint-plugin-import-x');
const { createTypeScriptImportResolver } = require('eslint-import-resolver-typescript');

module.exports = [
    ...nx.configs['flat/base'],
    ...nx.configs['flat/typescript'],
    ...nx.configs['flat/javascript'],
    ...nx.configs['flat/angular'],
    ...nx.configs['flat/angular-template'],
    {
        ignores: ['**/dist', '**/*.js', '**/src/polyfills.ts', '**/*.stories.ts', '**/stories', '**/.storybook'],
    },
    {
        languageOptions: {
            parserOptions: {
                parser: tseslint.parser,
                project: ['./tsconfig.*?.json'],
            },
        },
        plugins: {
            nx,
            rxjs,
        },
        files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
        rules: {
            'rxjs/no-unsafe-takeuntil': 'error',
            'rxjs/no-nested-subscribe': 'error',
            'rxjs/no-async-subscribe': 'warn',
            'rxjs/no-floating-observables': 'error',
            'rxjs/no-ignored-subscription': 'warn',
            'rxjs/no-unbound-methods': 'warn',
            'rxjs/throw-error': 'warn',
            'no-dupe-class-members': 'off',
            'no-unused-vars': 'off',
            '@typescript-eslint/ban-types': 'off',
            '@typescript-eslint/no-empty-function': 'off',
            '@typescript-eslint/no-unsafe-function-type': 'off',
            '@typescript-eslint/no-empty-object-type': 'off',
            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                    caughtErrorsIgnorePattern: '^_',
                },
            ],
            '@angular-eslint/template/no-negated-async': 'off',
            '@angular-eslint/no-input-rename': 'off',
            // Rules introduced by newer lint presets; kept as warnings until the code base is modernized
            '@angular-eslint/prefer-inject': 'warn',
            '@angular-eslint/prefer-on-push-component-change-detection': 'warn',
            'no-useless-assignment': 'warn',
            '@angular-eslint/template/label-has-associated-control': 'off',
            '@nx/enforce-module-boundaries': [
                'error',
                {
                    enforceBuildableLibDependency: true,
                    allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?js$'],
                    depConstraints: [
                        {
                            sourceTag: '*',
                            onlyDependOnLibsWithTags: ['*'],
                        },
                    ],
                },
            ],
        },
    },
    {
        files: ['**/*.html'],
        rules: {
            '@angular-eslint/template/label-has-associated-control': 'off',
            '@angular-eslint/template/no-negated-async': 'off',
            '@angular-eslint/template/prefer-control-flow': 'warn',
            '@angular-eslint/template/alt-text': 'warn',
            '@angular-eslint/template/click-events-have-key-events': 'warn',
            '@angular-eslint/template/eqeqeq': 'warn',
            '@angular-eslint/template/interactive-supports-focus': 'warn',
            '@angular-eslint/template/no-autofocus': 'warn',
        },
    },
    // Import hygiene within the projects (the dependencies between projects are checked by @nx/enforce-module-boundaries).
    {
        files: ['**/*.ts'],
        ...importX.flatConfigs.recommended,
    },
    {
        files: ['**/*.ts'],
        ...importX.flatConfigs.typescript,
    },
    {
        files: ['**/*.ts'],
        settings: {
            // Resolve the TypeScript path aliases (@nexplore/*) of the workspace.
            'import-x/resolver-next': [
                createTypeScriptImportResolver({
                    alwaysTryTypes: true,
                    project: path.join(__dirname, 'tsconfig.base.json'),
                }),
            ],
        },
        rules: {
            // `import type` is removed by TypeScript, so cycles that only consist of type imports are not reported.
            // (@typescript-eslint/consistent-type-imports cannot be enabled: with type-aware linting it would convert
            // constructor parameter types of Angular classes, which are needed as values for dependency injection.)
            'import-x/no-cycle': 'error',
            'import-x/no-duplicates': 'error',
            'import-x/no-self-import': 'error',
            'import-x/no-useless-path-segments': 'error',
        },
    },
    {
        files: ['**/*.json'],
        rules: {
            '@nx/dependency-checks': [
                'error',
                {
                    ignoredFiles: ['{projectRoot}/eslint.config.{js,cjs,mjs}'],
                },
            ],
        },
        languageOptions: {
            parser: require('jsonc-eslint-parser'),
        },
    },
    {
        files: ['samples/**/*.ts', 'samples/**/*.tsx'],
        rules: {
            '@angular-eslint/prefer-standalone': 'off',
        },
    },
];
