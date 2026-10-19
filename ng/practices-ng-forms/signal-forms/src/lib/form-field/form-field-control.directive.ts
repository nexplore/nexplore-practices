import { Directive, ElementRef, inject } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { PuiFormFieldService } from './form-field.service';

/**
 * Registers a control bound with `[formField]` with the closest `puiFormField`, the signal forms counterpart of
 * registering an `NgControl` with the form field service.
 *
 * It is applied automatically to every element with a `[formField]` binding that is inside a `puiFormField`.
 */
@Directive({
    selector: '[formField]',
    standalone: true,
})
export class PuiFormFieldControlDirective {
    constructor() {
        const formField = inject(FormField, { self: true });
        const service = inject(PuiFormFieldService, { optional: true });
        service?.registerFormField(formField, inject<ElementRef<HTMLElement>>(ElementRef).nativeElement);
    }
}
