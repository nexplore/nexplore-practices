import type { Config } from 'jest';
import { createCjsPreset } from 'jest-preset-angular/presets/index.js';

const config: Config = {
    ...createCjsPreset({
        tsconfig: '<rootDir>/tsconfig.spec.json',
    }),
    displayName: 'forms-signal-forms-angular-22',
    rootDir: '.',
    testEnvironment: 'jsdom',
    roots: ['<rootDir>/../src'],
    testMatch: ['<rootDir>/../src/**/*.spec.ts'],
    moduleNameMapper: {
        '^@angular/core$': '<rootDir>/node_modules/@angular/core/fesm2022/core.mjs',
        '^@angular/core/testing$': '<rootDir>/node_modules/@angular/core/fesm2022/testing.mjs',
        '^@angular/forms$': '<rootDir>/node_modules/@angular/forms/fesm2022/forms.mjs',
        '^@angular/forms/signals$': '<rootDir>/node_modules/@angular/forms/fesm2022/signals.mjs',
        '^@angular/forms/signals/compat$': '<rootDir>/node_modules/@angular/forms/fesm2022/signals-compat.mjs',
    },
    // Register before and after the preset environment: Angular core is imported by
    // test-setup.ts, while partial Signal Forms declarations are evaluated by the spec.
    setupFiles: ['<rootDir>/compiler-facade.cjs'],
    setupFilesAfterEnv: [
        '<rootDir>/test-setup.ts',
        '<rootDir>/compiler-facade.cjs',
    ],
};

export default config;
