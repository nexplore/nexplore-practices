import { trace } from '@nexplore/practices-ng-logging';
import { INVALID_CONTROL_DEFAULT_SELECTOR } from './form-state.types';

export function focusFirstInvalidControl(options?: { container?: Element | null; selector?: string }): void {
    const container = options?.container ?? document.querySelector<Element>('main') ?? document.body;
    const firstInvalidControl = container.querySelector<HTMLElement>(
        options?.selector ?? INVALID_CONTROL_DEFAULT_SELECTOR
    );

    trace('focusFirstInvalidControl', { firstInvalidControl, container });

    if (firstInvalidControl) {
        firstInvalidControl.scrollIntoView({ behavior: 'smooth', block: 'center' });

        firstInvalidControl.focus();
    }
}
