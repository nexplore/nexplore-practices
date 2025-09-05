import { Injector } from '@angular/core';

/**
 * Tries to destroy the injector if it has a destroy method.
 * 
 * @param injector The injector to destroy.
 */
export function tryDestroyInjector(injector: Injector): void {
    if ((injector as any)?.destroy) {
        // Try to destroy the previous injector. TODO: There is no public API for this
        (injector as any).destroy();
    }
}
