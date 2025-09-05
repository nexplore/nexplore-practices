import { AbstractControl, FormControl, FormGroup } from '@angular/forms';

export type FormControls<
    TControls extends {
        [K in keyof TControls]: AbstractControl<any, any>;
    }
> = {
    [K in keyof TControls]: AbstractControl<any, any>;
};

export type FormControlsOfGroup<TFormGroup extends FormGroup> = {
    [K in keyof TFormGroup['controls']]: TFormGroup['controls'][K];
};
//
// export type FormControlsOfValues<TValues extends Record<string, any>> = {
//     [K in keyof TValues]: AbstractControl<TValues[K], TValues[K]>;
// };

export type FormControlsOfValues<TValues> = TValues extends Record<string, any>
    ? {
          [K in keyof TValues]-?: FormControl<TValues[K]>;
      }
    : never;

export type AllPropsAMustBeInB<A, B> = keyof A extends keyof B ? A : never;
