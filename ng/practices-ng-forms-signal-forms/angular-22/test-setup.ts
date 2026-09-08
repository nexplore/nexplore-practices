import { CompilerFacadeImpl } from '@angular/compiler';
import { setupZoneTestEnv } from 'jest-preset-angular/setup-env/zone';

const angularGlobal = globalThis as typeof globalThis & {
    ng?: {
        ɵcompilerFacade?: CompilerFacadeImpl;
    };
};

angularGlobal.ng ??= {};
angularGlobal.ng.ɵcompilerFacade = new CompilerFacadeImpl();

setupZoneTestEnv();
