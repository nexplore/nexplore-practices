import { Provider } from '@angular/core';
import { provideSignalFormsConfig } from '@angular/forms/signals';

/**
 * Adds the Reactive Forms status classes (`ng-invalid`, `ng-dirty`, `ng-touched`, ...) to every element with a `[formField]`
 * binding, so DOM based helpers (`focusFirstInvalidControl`, the default selectors of `PuiFormStateConfig`) and existing
 * styles keep working.
 */
export function providePuiSignalFormsStatusClasses(): Provider[] {
    return provideSignalFormsConfig({
        classes: {
            'ng-valid': (b) => b.state().valid(),
            'ng-invalid': (b) => b.state().invalid(),
            'ng-pending': (b) => b.state().pending(),
            'ng-touched': (b) => b.state().touched(),
            'ng-untouched': (b) => !b.state().touched(),
            'ng-dirty': (b) => b.state().dirty(),
            'ng-pristine': (b) => !b.state().dirty(),
        },
    });
}
