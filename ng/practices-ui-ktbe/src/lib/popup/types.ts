import { InjectionToken } from '@angular/core';

export type PuibeModalConfig = {
    buttonsAlignment?: 'start' | 'end';
};

export const PUIBE_MODAL_CONFIG = new InjectionToken<PuibeModalConfig>('PUIBE_MODAL_CONFIG');
