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
    // Register Angular's compiler facade before any Signal Forms ESM module is evaluated.
    // SignalFormControl contains partial declarations that call the facade during module load.
    setupFiles: ['<rootDir>/angular-22/compiler-facade.ts'],
    setupFilesAfterEnv: ['<rootDir>/angular-22/test-setup.ts'],
};

export default config;
