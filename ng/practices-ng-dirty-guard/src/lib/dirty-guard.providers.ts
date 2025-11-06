import { Provider } from '@angular/core';
import { DirtyGuardConfig } from './services/types-internal';
import { PuiDirtyGuardConfig } from './types';

/**
 * Provides the dirty guard with specified configuration
 */
export function provideDirtyGuard(config: PuiDirtyGuardConfig): Provider {
    return {
        provide: DirtyGuardConfig,
        useValue: new DirtyGuardConfig(config),
    };
}
