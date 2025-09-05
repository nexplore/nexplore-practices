import { FormGroupControlsValues, FormValueSignalsRecord } from '../utils/form.types';
import { FormControls } from './form-group-types.internal';

export type FormGroupValueWithSignals<TControls extends FormControls<TControls>> = FormGroupControlsValues<TControls> &
    FormValueSignalsRecord<FormGroupControlsValues<TControls>>;
