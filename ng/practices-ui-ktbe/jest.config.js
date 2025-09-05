module.exports = {
    displayName: 'practices-ui-ktbe',
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
    reporters: [
        'default',
        [
            'jest-junit',
            {
                outputDirectory: 'build/temp/test-results',
                outputName: 'practices-ui-ktbe-testresults.xml',
                suiteName: 'practices-ui-tests',
            },
        ],
    ],
};
