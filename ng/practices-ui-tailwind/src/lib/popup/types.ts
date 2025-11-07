import { InjectionToken } from '@angular/core';

export type PuiModalConfig = {
    buttonsAlignment?: 'start' | 'end';
};

export const PUIBE_MODAL_CONFIG = new InjectionToken<PuiModalConfig>('PUIBE_MODAL_CONFIG');

