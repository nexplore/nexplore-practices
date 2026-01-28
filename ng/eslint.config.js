const nx = require('@nx/eslint-plugin');
const rxjs = require('eslint-plugin-rxjs');

module.exports = [
    ...nx.configs['flat/base'],
    ...nx.configs['flat/typescript'],
    ...nx.configs['flat/javascript'],
    ...nx.configs['flat/angular'],
    ...nx.configs['flat/angular-template'],
    {
        ignores: ['**/dist', '**/*.stories.ts', '**/stories', '**/.storybook'],
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
            'rxjs/no-ignored-observable': 'error',
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
