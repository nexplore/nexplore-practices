const { CompilerFacadeImpl } = require('@angular/compiler');

globalThis.ng ??= {};

// jest-preset-angular bundles its own compiler facade and may publish it while
// transforming a spec after Jest has evaluated setup files. Keep Angular 22's
// facade in place unless the replacement supports the API used by Signal Forms.
let compilerFacade = new CompilerFacadeImpl();
Object.defineProperty(globalThis.ng, 'ɵcompilerFacade', {
    configurable: true,
    enumerable: true,
    get: () => compilerFacade,
    set: (candidate) => {
        if (typeof candidate?.compileServiceDeclaration === 'function') {
            compilerFacade = candidate;
        }
    },
});
