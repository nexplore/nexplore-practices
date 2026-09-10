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
    // Register the matching Angular compiler facade after jest-preset-angular's bundled
    // transformer has loaded, but before Signal Forms' partial declarations are evaluated.
    setupFilesAfterEnv: [
        '<rootDir>/angular-22/test-setup.ts',
        '<rootDir>/angular-22/compiler-facade.cjs',
    ],
};

export default config;
