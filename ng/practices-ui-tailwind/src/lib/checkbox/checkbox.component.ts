import { AsyncPipe, NgClass } from '@angular/common';
import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    forwardRef,
    inject,
    Injector,
    Input,
    OnDestroy,
} from '@angular/core';
import {
    AbstractControl,
    ControlValueAccessor,
    NG_VALUE_ACCESSOR,
    NgControl,
    TouchedChangeEvent,
} from '@angular/forms';
import { PuiFormFieldDirective, PuiFormFieldService, PuiReadonlyDirective } from '@nexplore/practices-ng-forms';
import { DestroyService } from '@nexplore/practices-ui';
import { TranslateModule } from '@ngx-translate/core';
import { BehaviorSubject, combineLatest, delay, filter, map, merge, of, shareReplay, startWith, switchMap } from 'rxjs';
import { FormFieldStatus } from '../form-field/form-field.service';
import { FORM_CONFIG, FormConfig } from '../form/form.config';
import { PuiReadonyLabelValueComponent } from '../readonly-label-value/readonly-label-value.component';
import { getElementFormStates$ } from '../util/form.utils';
import { PuiCheckboxGroupComponent } from './checkbox-group.component';

let nextUniqueId = 0;

@Component({
    standalone: true,
    selector: 'pui-checkbox',
    templateUrl: './checkbox.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [NgClass, AsyncPipe, TranslateModule, PuiReadonyLabelValueComponent],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            multi: true,
            useExisting: forwardRef(() => PuiCheckboxComponent),
        },
        DestroyService,
    ],
    hostDirectives: [PuiFormFieldDirective],
})
export class PuiCheckboxComponent implements ControlValueAccessor, AfterViewInit, OnDestroy {
    private readonly _injector = inject(Injector);
    private readonly _elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly _formFieldService = inject(PuiFormFieldService);
    private readonly _parent = inject(PuiCheckboxGroupComponent, { optional: true });
    private readonly _config = inject<FormConfig>(FORM_CONFIG, { optional: true });
    private readonly _destroy$ = inject(DestroyService, { optional: true });
    private readonly _readonlyDirective = inject(PuiReadonlyDirective, { optional: true });

    private _ngControlSubject = new BehaviorSubject<NgControl | null>(null);
    private _innerControlSubject = new BehaviorSubject<AbstractControl | null>(null);
    private _onChange: ((value: unknown) => void) | null = null;

    private _ngControl$ = this._ngControlSubject.pipe(
        filter((ngControl): ngControl is NgControl => ngControl != null),
        delay(0), // this delay is needed to prevent issues with initial binding
    );
    private _valueChanges$ = this._ngControl$.pipe(switchMap((ngControl) => ngControl.valueChanges ?? []));
    private _statusChanges$ = this._ngControl$.pipe(switchMap((ngControl) => ngControl.statusChanges ?? []));

    readonly id = 'pui-checkbox-' + nextUniqueId++;

    @Input()
    useSmallTextForReadonlyLabel: boolean | null = null;

    @Input()
    label: string;

    /**
     * If true, the label will be aligned vertically to the start of the checkbox.
     */
    @Input()
    alignLabelStart = false;

    @Input()
    description: string;

    readonly value$ = merge(this._valueChanges$, this._ngControl$.pipe(map((control) => control.value)));
    readonly checked$ = this.value$.pipe(map((value) => value === true));

    readonly status$ = merge(this._statusChanges$, this._ngControl$.pipe(map((control) => control.status))).pipe(
        map((s) => s as FormFieldStatus),
    );

    readonly isRequired$ = this._formFieldService.isRequired$;

    readonly touched$ = this._ngControl$.pipe(
        switchMap((ngControl) => ngControl.control?.events ?? []),
        filter((event) => event instanceof TouchedChangeEvent),
        map((event) => event.touched),
    );

    readonly isReadonly$ = this._readonlyDirective?.isReadonly$ ?? of(false);

    readonly invalid$ = this.status$.pipe(map((status) => status === 'INVALID'));

    readonly displayAsInvalid$ = combineLatest([this.invalid$, this.touched$, this._ngControl$]).pipe(
        map(([invalid, touched, _]) => {
            const hideInvalidIfUntouched = this._config?.hideInvalidIfUntouched ?? false;
            const allowDisplayAsInvalid = hideInvalidIfUntouched ? touched : true;
            return invalid && allowDisplayAsInvalid;
        }),
        startWith(false),
    );

    readonly pending$ = this.status$.pipe(map((status) => status === 'PENDING'));

    readonly disabled$ = this.status$.pipe(map((status) => status === 'DISABLED'));

    readonly errors$ = combineLatest([this._ngControl$, this.displayAsInvalid$]).pipe(
        map(([ngControl, displayAsInvalid]) => {
            if (!displayAsInvalid || ngControl.errors == null) {
                return [] as { key: string; param: unknown }[];
            }
            return Object.entries(ngControl.errors)
                .map(([key, value]) => [this.capitalizeFirstLetter(key), value] as const)
                .map(([key, value]) => ({ key: `Messages.Validation_${key}`, param: value }));
        }),
    );

    readonly elementState$ = getElementFormStates$(this._elementRef.nativeElement).pipe(
        shareReplay({ refCount: true, bufferSize: 1 }),
    );

    readonly dirty$ = this.elementState$.pipe(map((state) => state.dirty));

    isInGroup = false;
    groupId: string | null = null;

    constructor() {
        const _parent = this._parent;
        const _destroy$ = this._destroy$;

        if (_parent != null) {
            this.isInGroup = true;
            this.groupId = _parent.id;

            _parent.registerChildCheckbox(this, _destroy$);
        }
    }

    ngAfterViewInit(): void {
        const ngControl = this._injector.get(NgControl);
        this._formFieldService.registerNgControl(ngControl, this._elementRef.nativeElement);
        this._ngControlSubject.next(ngControl);
        this._innerControlSubject.next(ngControl.control);

        // This is a hack to fix the initial pending state: https://github.com/angular/angular/issues/41519
        // Potential cause of future problems...
        setTimeout(() => {
            if (ngControl.status === 'PENDING') {
                ngControl.control?.updateValueAndValidity();
            }
        });
    }

    onChange() {
        if (this._innerControlSubject.value !== this._ngControlSubject.value?.control) {
            this._innerControlSubject.next(this._ngControlSubject.value?.control ?? null);
            this._ngControlSubject.next(this._ngControlSubject.value); // Emits the same reference, however triggers updates in the following subscriptions
        }

        if (this.isInGroup) {
            this._parent.markAsTouched();
        } else {
            this.markAsTouched();
        }

        const ngControl = this._ngControlSubject.getValue();
        if (ngControl != null && this._onChange != null) {
            this._onChange(!ngControl.value);
        }
    }

    markAsTouched() {
        const ngControl = this._ngControlSubject.getValue();
        if (ngControl?.control) {
            ngControl.control.markAsTouched();
            ngControl.control.updateValueAndValidity();
            if (!ngControl.touched && this._onTouched) {
                this._onTouched();
            }
        }
    }

    writeValue(_: unknown): void {}

    registerOnChange(onChange: (value: unknown) => void): void {
        this._onChange = onChange;
    }

    private _onTouched: () => void = () => {};

    registerOnTouched(onTouched: () => void): void {
        this._onTouched = onTouched;
    }

    ngOnDestroy(): void {
        this._ngControlSubject.complete();
    }

    private capitalizeFirstLetter(value: string) {
        return value.charAt(0).toUpperCase() + value.slice(1);
    }
}

