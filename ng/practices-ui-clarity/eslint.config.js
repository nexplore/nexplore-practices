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

        rules: {
            '@angular-eslint/directive-selector': [
                'warn',
                {
                    type: 'attribute',
                    prefix: 'puiclr',
                    style: 'camelCase',
                },
            ],
            '@angular-eslint/component-selector': [
                'error',
                {
                    type: 'element',
                    prefix: 'puiclr',
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
