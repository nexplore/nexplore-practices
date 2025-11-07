import { Injectable, OnDestroy, inject } from '@angular/core';
import { NgControl, Validators } from '@angular/forms';
import { BehaviorSubject, combineLatest, delay, filter, map, merge, shareReplay, startWith, switchMap } from 'rxjs';
import { FORM_CONFIG, FormConfig } from '../form/form.config';
import { getElementFormStates$ } from '../util/form.utils';

let nextUniqueId = 0;

export type Status = 'VALID' | 'INVALID' | 'DISABLED' | 'PENDING' | 'NONE';

// TODO: Should probybly be replaced completely by PuiFormFieldService
@Injectable()
export class RadioButtonGroupService implements OnDestroy {
    private readonly _config = inject<FormConfig>(FORM_CONFIG, { optional: true });

    private readonly _hideOptionalSubject = new BehaviorSubject<boolean>(false);
    private readonly _nameSubject = new BehaviorSubject<string>(`puibe-radio-button-group-${nextUniqueId++}`);
    private readonly _ngControlSubject = new BehaviorSubject<NgControl>(null);
    private _elementSubject = new BehaviorSubject<HTMLElement>(null);
    private _onChange: (value: any) => void = null;

    private readonly _ngControl$ = this._ngControlSubject.pipe(
        filter((ngControl) => ngControl != null),
        delay(0) // this delay is needed to prevent issues with initial binding
    );
    private readonly _valueChanges$ = this._ngControl$.pipe(switchMap((ngControl) => ngControl.valueChanges));
    private readonly _statusChanges$ = this._ngControl$.pipe(switchMap((ngControl) => ngControl.statusChanges));

    readonly value$ = merge(this._valueChanges$, this._ngControl$.pipe(map((control) => control.value)));

    readonly status$ = merge(this._statusChanges$, this._ngControl$.pipe(map((control) => control.status))).pipe(
        map((s) => s as Status)
    );

    readonly isRequired$ = this._ngControl$.pipe(
        switchMap((ngControl) => this.status$.pipe(map(() => ngControl.control.hasValidator(Validators.required))))
    );

    readonly invalid$ = this.status$.pipe(map((status) => status === 'INVALID'));
    readonly displayAsInvalid$ = combineLatest([this.invalid$, this._ngControl$]).pipe(
        map(([invalid, ngControl]) => {
            const hideInvalidIfUntouched = this._config?.hideInvalidIfUntouched ?? false;
            const allowDisplayAsInvalid = hideInvalidIfUntouched ? ngControl.touched : true;
            return invalid && allowDisplayAsInvalid;
        }),
        startWith(false)
    );
    readonly pending$ = this.status$.pipe(map((status) => status === 'PENDING'));
    readonly disabled$ = this.status$.pipe(map((status) => status === 'DISABLED'));

    readonly errors$ = combineLatest([this._ngControl$, this.displayAsInvalid$]).pipe(
        map(([ngControl, displayAsInvalid]) => {
            if (!displayAsInvalid) {
                return null;
            }

            return ngControl.errors;
        })
    );

    readonly elementState$ = this._elementSubject.pipe(
        switchMap((el) => getElementFormStates$(el)),
        shareReplay({ refCount: true, bufferSize: 1 })
    );

    registerNgControl(ngControl: NgControl, element: HTMLElement) {
        this._ngControlSubject.next(ngControl);
        this._elementSubject.next(element);

        // This is a hack to fix the initial pending state: https://github.com/angular/angular/issues/41519
        // Potential cause of future problems...
        setTimeout(() => {
            if (ngControl.status === 'PENDING') {
                ngControl.control.updateValueAndValidity();
            }
        });
    }

    registerOnChange(onChange: (value: any) => void) {
        this._onChange = onChange;
    }

    get hideOptional$() {
        return this._hideOptionalSubject.asObservable();
    }

    setHideOptional(value: boolean) {
        this._hideOptionalSubject.next(value);
    }

    get name$() {
        return this._nameSubject.asObservable();
    }

    setName(value: string) {
        this._nameSubject.next(value);
    }

    setValue(value: any) {
        if (this._onChange) {
            this._onChange(value);
        }
    }

    ngOnDestroy(): void {
        this._nameSubject.complete();
        this._ngControlSubject.complete();
    }

    markAsTouched() {
        const ngControl = this._ngControlSubject.getValue();

        if (ngControl) {
            ngControl.control.markAsTouched();
            ngControl.control.updateValueAndValidity();
        }
    }
}
