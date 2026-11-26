import type { AbstractControl } from '@angular/forms';
import { delay, map, of } from 'rxjs';

export const randomAsyncValidator = (_: AbstractControl) => {
    return of(Math.random() > 0.5)
        .pipe(delay(2000))
        .pipe(
            map((result) => {
                return !result ? { notBob: true } : null;
            })
        );
};
