const nx = require('@nx/eslint-plugin');
const baseConfig = require('../eslint.config.js');

module.exports = [
    {
        files: ['**/*.json'],
        rules: {
            '@nx/dependency-checks': ['error', { ignoredFiles: ['{projectRoot}/eslint.config.{js,cjs,mjs}'] }],
        },
        languageOptions: { parser: require('jsonc-eslint-parser') },
    },
    ...nx.configs['flat/angular'],
    ...nx.configs['flat/angular-template'],
    ...baseConfig,
    {
        files: ['**/*.ts'],
        languageOptions: {
            parserOptions: {
                project: './tsconfig.*?.json',
            },
        },
        rules: {
            '@angular-eslint/directive-selector': [
                'warn',
                {
                    type: 'attribute',
                    prefix: 'pui',
                    style: 'camelCase',
                },
            ],
            '@angular-eslint/component-selector': [
                'error',
                {
                    type: 'element',
                    prefix: 'pui',
                    style: 'kebab-case',
                },
            ],
        },
    },
    {
        files: ['**/*.html'],
        // Override or add rules here
        rules: {},
    },
];
