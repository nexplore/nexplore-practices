import { Signal } from '@angular/core';
import { AbstractControl, FormControl, FormControlState, FormGroup, ValidationErrors } from '@angular/forms';

export interface INswagGeneratedType {
    init(_data?: any): void;
    toJSON(data?: any): any;
}

type DotPrefix<T extends string> = T extends '' ? '' : `.${T}`;
export type DeepKeyOfFormGroup<T extends FormGroup> = (
    [T] extends [never]
        ? ''
        : T extends FormGroup
        ? {
              [K in Exclude<keyof T['controls'], symbol>]: `${K}${undefined extends T['controls'][K]
                  ? '?'
                  : ''}${DotPrefix<T['controls'][K] extends FormGroup ? DeepKeyOfFormGroup<T['controls'][K]> : ''>}`;
          }[Exclude<keyof T['controls'], symbol>]
        : ''
) extends infer D
    ? Extract<D, string>
    : never;

export type FormGroupControlsValues<
    TControls extends {
        [K in keyof TControls]: AbstractControl<any, any>;
    }
> = {
    [key in keyof TControls]: TControls[key] extends AbstractControl<any, infer TValue extends any>
        ? Exclude<TValue, FormControlState<any>>
        : never;
};

export type FormGroupValues<TForm extends FormGroup> = TForm extends FormGroup<infer TControls>
    ? {
          [key in keyof TControls]: TControls[key] extends AbstractControl<any, infer TValue extends any>
              ? Exclude<TValue, FormControlState<any>>
              : never;
      }
    : never;

/**
 * Make all properties in T nullable
 */
export type Nullable<T> = {
    [P in keyof T]: T[P] | null;
};

export type PartialNullable<T> = Partial<Nullable<T>>;

export type DtoPropsOnly<T> = Omit<T, 'init' | 'toJSON'>;

export type TypedFormGroup<T> = FormGroup<{
    [P in keyof DtoPropsOnly<T>]: FormControl<DtoPropsOnly<T>[P]>;
}>;

export type TypedPartialFormGroup<T> = FormGroup<any> & {
    controls: {
        [P in keyof DtoPropsOnly<T>]?: AbstractControl<null | DtoPropsOnly<T>[P]>;
    };
};

export type UndefinedAsNull<T> = {
    [P in keyof T]-?: T[P] extends undefined ? null : T[P];
};

export type TypedPartialFormGroupValues<TForm extends TypedPartialFormGroup<TValue>, TValue> = TForm extends FormGroup<
    infer TControls
>
    ? {
          [key in keyof TControls]: TControls[key] extends AbstractControl<any, infer TValue extends any>
              ? Exclude<TValue, FormControlState<any>>
              : never;
      }
    : never;

export type FormControlArrayValues<TControls extends AbstractControl<any, any>[]> = TControls extends Array<
    infer TControl
>
    ? TControl extends AbstractControl<any, infer TValue>
        ? Exclude<TValue, FormControlState<any>>[]
        : never
    : never;

export type FormGroupValidatorResult<
    TControls extends {
        [K in keyof TControls]: AbstractControl<any, any>;
    }
> = {
    controlNames: (keyof TControls | DeepKeyOfFormGroup<FormGroup<TControls>>)[];
    errors: ValidationErrors | null;
} | null;

export type FormControlValue<TControl extends AbstractControl<any, any>> = TControl extends AbstractControl<
    any,
    infer TValue
>
    ? Exclude<TValue, FormControlState<any>>
    : never;

export type FormControlValueMonNull<TControl extends AbstractControl<any, any>> = TControl extends AbstractControl<
    any,
    infer TValue
>
    ? Exclude<TValue, FormControlState<any> | null>
    : never;

export type FormValueSignalsRecord<TFormValue> = {
    [key in keyof TFormValue as key extends string ? `${key}Signal` : never]: Signal<TFormValue[key]>;
};

export type FormValueSignalsRecordWithoutPostfix<TFormValue> = {
    [key in keyof TFormValue]: Signal<TFormValue[key]>;
};

