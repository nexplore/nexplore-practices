import { ElementRef } from '@angular/core';
import { setHostAttr } from './utils';

export function applyLanguageAriaAttributes(elementRef: ElementRef<HTMLElement>, locale: string) {
    if (locale) {
        let label;

        switch (locale?.toUpperCase()) {
            case 'DE':
                label = 'Deutsch';
                break;
            case 'FR':
                label = 'Français';
                break;
            case 'IT':
                label = 'Italiano';
                break;
            case 'EN':
                label = 'English';
                break;
        }

        if (label) {
            setHostAttr('aria-label', label, elementRef);
            setHostAttr('title', label, elementRef);
        }

        setHostAttr('lang', locale, elementRef);
    }
}
