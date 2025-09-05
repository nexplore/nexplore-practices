import {AbstractControl, FormArray, FormGroup, ValidationErrors} from "@angular/forms";


/**
 * Combines the errors of all controls in a form group into a single object.
 * @param form
 */
export function combineDirectiveControlErrors(form: FormGroup | AbstractControl): ValidationErrors | null {
    if (form.invalid) {
        if (form instanceof FormGroup) {
            const controlErrors = Object.fromEntries(
                Object.entries(form.controls).flatMap(([_, c]) => Object.entries(c.errors ?? {}))
            );
            return { ...form.errors, ...controlErrors };
        } else if (form instanceof FormArray) {
            const controlErrors = Object.fromEntries(form.controls.flatMap((c) => Object.entries(c.errors ?? {})));
            return { ...form.errors, ...controlErrors };
        } else {
            return form.errors;
        }
    } else {
        return null;
    }
}
