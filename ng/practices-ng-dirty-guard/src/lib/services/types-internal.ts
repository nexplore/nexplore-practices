import { UrlTree } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { PuiCanDeactivate, PuiDirtyGuardConfig, PuiHasDirtyFormState } from '../types';

export type DirtyGuardSupportedComponent = PuiHasDirtyFormState | PuiCanDeactivate;
export type AsyncResult = Observable<boolean | UrlTree> | Promise<boolean | UrlTree>;
export type Result = boolean | UrlTree;

export class DirtyGuardConfig implements PuiDirtyGuardConfig {
    constructor(config: PuiDirtyGuardConfig) {
        this.evaluateDiscardChangesAsyncHandler = config.evaluateDiscardChangesAsyncHandler;
    }

    evaluateDiscardChangesAsyncHandler: () => boolean | Observable<boolean> | Promise<boolean>;
}

export interface DirtyGuardComponentState {
    component: DirtyGuardSupportedComponent;
    dirty?: boolean;
    subscription?: Subscription;
}
