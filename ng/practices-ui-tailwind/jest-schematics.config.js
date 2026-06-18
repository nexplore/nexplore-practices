module.exports = {
    ...require('./jest.config.js'),
    testEnvironment: 'node',
    testPathIgnorePatterns: [],
    testMatch: ['<rootDir>/schematics/**/*.spec.ts'],
};
