module.exports = {
    globals: {
        passWithNoTests: true,
    },
    transform: {
        '^.+\\.tsx?$': [
            'ts-jest',
            {
                tsconfig: '<rootDir>/tsconfig.spec.json',
                diagnostics: {
                    ignoreCodes: [151001],
                },
            },
        ],
    },
    modulePathIgnorePatterns: ['<rootDir>/dist'],
    reporters: [
        'default',
        [
            'jest-junit',
            {
                outputDirectory: '<rootDir>',
                outputName: 'samples-tailwind-testresults.xml',
                suiteName: 'samples-tailwind-tests',
            },
        ],
    ],
};
