import { CompilerFacadeImpl } from '@angular/compiler';

const angularGlobal = globalThis as typeof globalThis & {
    ng?: {
        ɵcompilerFacade?: CompilerFacadeImpl;
    };
};

angularGlobal.ng ??= {};
angularGlobal.ng.ɵcompilerFacade = new CompilerFacadeImpl();
