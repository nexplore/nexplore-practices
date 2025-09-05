import {FormControl, FormGroup} from '@angular/forms';


describe('FormGroup assumptions', () => {
    // Test some assumptions of how the form group behaves internally.

    it('should return same ref of same value', () => {
        const formGroup = new FormGroup({
            a: new FormControl(1),
            b: new FormControl(2),
        });

        const value1 = formGroup.value;
        const value2 = formGroup.value;

        expect(value1).toBe(value2);
    });

    it('should return new ref when value change', () => {
        const formGroup = new FormGroup({
            a: new FormControl(1),
            b: new FormControl(2),
        });

        const value1 = formGroup.value;

        formGroup.controls.a.setValue(3);

        const value2 = formGroup.value;

        expect(value1).not.toBe(value2);
    });
});
