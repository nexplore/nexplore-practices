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
    // Register before and after the preset environment: Angular core is imported by
    // test-setup.ts, while partial Signal Forms declarations are evaluated by the spec.
    setupFiles: ['<rootDir>/angular-22/compiler-facade.cjs'],
    setupFilesAfterEnv: [
        '<rootDir>/angular-22/test-setup.ts',
        '<rootDir>/angular-22/compiler-facade.cjs',
    ],
};

export default config;
