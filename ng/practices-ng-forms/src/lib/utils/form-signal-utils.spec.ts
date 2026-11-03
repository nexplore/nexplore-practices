import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { formGroupCurrentValueMappedSignal } from './form-signal-utils';

describe('formGroupCurrentValueMappedSignal', () => {
    type Value = { a: number | null; b: string | null };

    function setup(
        options?: Parameters<typeof formGroupCurrentValueMappedSignal<Value, FormGroup, never[], Value>>[1]
    ) {
        const formGroup = new FormGroup({
            a: new FormControl(1),
            b: new FormControl('x'),
        });
        const emissions: Value[] = [];
        const signal = TestBed.runInInjectionContext(() =>
            formGroupCurrentValueMappedSignal<Value, FormGroup, never[], Value>(formGroup, {
                ...options,
                // `filter` runs after `distinctUntilChanged`, so it sees exactly the values that passed the comparator.
                filter: (values) => {
                    emissions.push(values);
                    return true;
                },
            })
        );
        // Flush the initial `startWith` emission through the debounce.
        tick(1);
        return { formGroup, signal, emissions };
    }

    describe('default distinct comparator', () => {
        it('should emit the initial value', fakeAsync(() => {
            const { signal, emissions } = setup();

            expect(emissions).toEqual([{ a: 1, b: 'x' }]);
            expect(signal()).toEqual({ a: 1, b: 'x' });
        }));

        it('should not emit again when a new value object has the same properties', fakeAsync(() => {
            const { formGroup, emissions } = setup();

            formGroup.setValue({ a: 1, b: 'x' });
            formGroup.patchValue({ b: 'x' });
            tick(1);

            expect(emissions).toEqual([{ a: 1, b: 'x' }]);
        }));

        it('should emit when a property changes', fakeAsync(() => {
            const { formGroup, signal, emissions } = setup();

            formGroup.controls.a.setValue(2);
            tick(1);
            formGroup.controls.b.setValue(null);
            tick(1);

            expect(emissions).toEqual([
                { a: 1, b: 'x' },
                { a: 2, b: 'x' },
                { a: 2, b: null },
            ]);
            expect(signal()).toEqual({ a: 2, b: null });
        }));
    });

    it('should use a custom distinct comparator instead of the default one', fakeAsync(() => {
        const { formGroup, emissions } = setup({ distinctComparator: () => true });

        formGroup.controls.a.setValue(2);
        tick(1);

        expect(emissions).toEqual([{ a: 1, b: 'x' }]);
    }));
});
