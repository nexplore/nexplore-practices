import type { Config } from 'jest';

const config: Config = {
    displayName: 'forms-signal-forms-angular-22',
    rootDir: '..',
    testEnvironment: 'jsdom',
    testMatch: ['<rootDir>/src/**/*.spec.ts'],
    setupFilesAfterEnv: ['<rootDir>/angular-22/test-setup.ts'],
    transform: {
        '^.+\\.(ts|mjs|js|html)$': [
            'jest-preset-angular',
            {
                tsconfig:
                    '<rootDir>/angular-22/tsconfig.spec.json',
                stringifyContentPathRegex: '\\.(html|svg)$',
            },
        ],
    },
    transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
};

export default config;
