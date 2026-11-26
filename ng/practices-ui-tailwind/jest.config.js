module.exports = {
    displayName: 'practices-ui-tailwind',
    preset: '../jest.preset.js',
    transform: {
        '^.+\\.(ts|mjs|js|html)$': [
            'jest-preset-angular',
            {
                tsconfig: '<rootDir>/tsconfig.spec.json',
                stringifyContentPathRegex: '\\.(html|svg)$',
            },
        ],
    },
    transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
    testPathIgnorePatterns: ['<rootDir>/schematics'],
    reporters: [
        'default',
        [
            'jest-junit',
            {
                outputDirectory: 'build/temp/test-results',
                outputName: 'practices-ui-tailwind-testresults.xml',
                suiteName: 'practices-ui-tests',
            },
        ],
    ],
};
