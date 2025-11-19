import { Signal } from '@angular/core';
import { FormGroupControlsValues } from '../utils/form.types';
import { FormControls } from './form-group-types.internal';

export type FormValueSignalsRecordDeprecated<TFormValue> = {
    /**
     * @deprecated Use formGroup.valueSignal instead
     */
    [key in keyof TFormValue as key extends string ? `${key}Signal` : never]: Signal<TFormValue[key]>;
};

export type FormGroupValueWithSignals<TControls extends FormControls<TControls>> = FormGroupControlsValues<TControls> &
    FormValueSignalsRecordDeprecated<FormGroupControlsValues<TControls>>;

