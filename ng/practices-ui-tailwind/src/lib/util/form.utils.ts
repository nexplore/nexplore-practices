import { EMPTY, Observable } from 'rxjs';

export type ElementFormState = {
    dirty: boolean;
    touched: boolean;
    pristine: boolean;
    invalid: boolean;
    valid: boolean;
};

/** @deprecated - If you need the form state changes, FormGroup now exposes `events` observable.
 */
export function getElementFormStates$(el: Element): Observable<ElementFormState> {
    if (!el) {
        return EMPTY;
    }

    return new Observable<ElementFormState>((subscriber) => {
        const observer = new MutationObserver((_) => {
            subscriber.next({
                dirty: el.classList.contains('ng-dirty'),
                touched: el.classList.contains('ng-touched'),
                pristine: el.classList.contains('ng-pristine'),
                invalid: el.classList.contains('ng-invalid'),
                valid: el.classList.contains('ng-valid'),
            });
        });

        observer.observe(el, { attributes: true, attributeFilter: ['class'] });

        return () => {
            observer.disconnect();
        };
    });
}
