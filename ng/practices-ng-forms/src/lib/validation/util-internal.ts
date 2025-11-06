import { AbstractControl, FormGroup } from '@angular/forms';

export function getControlsByNamesOfFormGroup(
    formGroup: AbstractControl,
    controlNames: string[]
): { name: string; control: AbstractControl }[] {
    function getControlsRec(
        formGroup: AbstractControl,
        controlNames: string[]
    ): { name: string; control: AbstractControl }[] {
        const control = formGroup.get(controlNames[0]);
        if (controlNames.length === 1) {
            return control ? [{ control, name: controlNames[0] }] : [];
        }
        if (control instanceof FormGroup) {
            return getControlsRec(control, controlNames.slice(1));
        }
        return [];
    }

    const controls = controlNames.flatMap((name) =>
        name.includes('.') ? getControlsRec(formGroup, name.split('.')) : [{ control: formGroup.get(name), name }]
    );

    if (controls.some((c) => !c)) {
        return [];
    }

    return controls.filter((c): c is { name: string; control: AbstractControl } => c != null);
}
