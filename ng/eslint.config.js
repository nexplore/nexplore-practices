const nx = require('@nx/eslint-plugin');
const rxjs = require('eslint-plugin-rxjs-x').default;

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
                parser: require('@typescript-eslint/parser'),
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
            // External templates were not linted by the previous `@nx/eslint:lint` targets (only `**/*.ts`);
            // the inferred `eslint .` target now covers them. Kept as warnings until the templates are fixed.
            '@angular-eslint/template/alt-text': 'warn',
            '@angular-eslint/template/click-events-have-key-events': 'warn',
            '@angular-eslint/template/eqeqeq': 'warn',
            '@angular-eslint/template/interactive-supports-focus': 'warn',
            '@angular-eslint/template/no-autofocus': 'warn',
        },
    },
    {
        files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
        // Override or add rules here
        rules: {},
    },
    {
        files: ['**/*.json'],
        rules: {
            '@nx/dependency-checks': ['error', { ignoredFiles: ['{projectRoot}/eslint.config.{js,cjs,mjs}'] }],
        },
        languageOptions: { parser: require('jsonc-eslint-parser') },
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
