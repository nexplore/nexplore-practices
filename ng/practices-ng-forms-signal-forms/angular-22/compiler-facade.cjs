const { CompilerFacadeImpl } = require('@angular/compiler');

globalThis.ng ??= {};

// jest-preset-angular bundles its own compiler facade and may publish it while
// transforming a spec after Jest has evaluated setup files. Keep the facade
// loaded from this package's Angular 22 compiler in place for the whole suite.
const compilerFacade = new CompilerFacadeImpl();
Object.defineProperty(globalThis.ng, 'ɵcompilerFacade', {
    configurable: true,
    enumerable: true,
    get: () => compilerFacade,
    set: () => {},
});
