import type { Config } from 'jest';
import { createCjsPreset } from 'jest-preset-angular/presets/index.js';

const config: Config = {
    ...createCjsPreset({
        tsconfig: '<rootDir>/angular-22/tsconfig.spec.json',
    }),
    displayName: 'forms-signal-forms-angular-22',
    rootDir: '..',
    testEnvironment: 'jsdom',
    testMatch: ['<rootDir>/src/**/*.spec.ts'],
    setupFilesAfterEnv: ['<rootDir>/angular-22/test-setup.ts'],
};

export default config;
