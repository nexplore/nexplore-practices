module.exports = {
    ...require('./jest.config.js'),
    testEnvironment: 'node',
    testPathIgnorePatterns: [],
    testMatch: ['<rootDir>/schematics/**/*.spec.ts'],
    moduleNameMapper: { '^ora$': '<rootDir>/jest-schematics.ora-stub.js' },
};
