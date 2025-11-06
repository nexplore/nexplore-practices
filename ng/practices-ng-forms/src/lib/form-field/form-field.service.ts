import { DecimalPipe } from '@angular/common';
import { DestroyRef, EventEmitter, inject, Injectable, OnDestroy, Type } from '@angular/core';
import { NgControl, PristineChangeEvent, TouchedChangeEvent } from '@angular/forms';
import {
    BehaviorSubject,
    combineLatest,
    combineLatestWith,
    defer,
    delay,
    EMPTY,
    filter,
    fromEvent,
    isObservable,
    map,
    merge,
    Observable,
    of,
    shareReplay,
    startWith,
    switchMap,
} from 'rxjs';
import { FORM_FIELD_CONFIG_DEFAULTS } from './form-field.provider';
import { PUI_FORM_FIELD_CONFIG, PuiFormFieldConfig } from './pui-form-field.config';

let nextUniqueId = 0;

export type FormFieldStatus = 'VALID' | 'INVALID' | 'DISABLED' | 'PENDING' | 'NONE';

export interface FormFieldIconConfig {
    /**
     * The type of the component to be instantiated
     */
    component: Type<any>;

    /**
     * When true, the icon will fill the whole height of the form-field
     */
    fill?: boolean;

    /**
     * When true, the icon background/fill color will be inverted
     */
    invert?: boolean;

    /**
     * Set a custom css class
     */
    className?: string;

    /**
     * When true, the icon will appear clickable (and emits iconClick event)
     */
    clickable?: boolean;

    /**
     * When true, the icon will only be displayed if the form field is valid
     */
    showOnlyIfValid?: boolean;

    /** Alternative title text for icon */
    title?: string;
}

export interface FormFieldOverlayTextConfig {
    /**
     * The text to be displayed
     */
    text?: string;

    /**
     * If `true` renders the text as focused
     */
    isFocused?: boolean;
}

@Injectable()
export class PuiFormFieldService implements OnDestroy {
    private readonly _decimalPipe = inject(DecimalPipe);

    public readonly config =
        inject<PuiFormFieldConfig>(PUI_FORM_FIELD_CONFIG, { optional: true }) ?? FORM_FIELD_CONFIG_DEFAULTS;

    private readonly _ngControlSubject = new BehaviorSubject<NgControl | null>(null);
    private readonly _elementSubject = new BehaviorSubject<HTMLElement | null>(null);
    private readonly _valueChanges$ = defer(() => this.ngControl$).pipe(
        switchMap((ngControl) => ngControl.valueChanges ?? EMPTY)
    );
    private readonly _statusChanges$ = defer(() => this.ngControl$).pipe(
        switchMap((ngControl) => ngControl.statusChanges ?? EMPTY)
    );
    private readonly _idSubject = new BehaviorSubject<string>(`pui-form-field-${nextUniqueId++}`);
    private readonly _loadingSubject = new BehaviorSubject<boolean>(false);
    private readonly _iconSubject = new BehaviorSubject<FormFieldIconConfig | null>(null);
    private readonly _clearableSubject = new BehaviorSubject<boolean>(false);
    private readonly _overlayTextSubject = new BehaviorSubject<FormFieldOverlayTextConfig | null>(null);
    private readonly _iconClickEmitter = new EventEmitter<MouseEvent>();
    private readonly _clearEmitter = new EventEmitter<void>();
    private readonly _ariaDescriptionSubject = new BehaviorSubject<string | null>(null);
    private readonly _elementPlaceholderSubject = new BehaviorSubject<string | null>(null);
    private readonly _focusedPlaceholderSubject = new BehaviorSubject<string | null>(null);
    private readonly _labelAsPlaceholderSubject = new BehaviorSubject<string | null>(null);

    public readonly ngControl$ = this._ngControlSubject.pipe(
        filter((ngControl) => ngControl != null),
        delay(0) // this delay is needed to prevent issues with initial binding
    );

    public readonly value$ = merge(this._valueChanges$, this.ngControl$.pipe(map((control) => control.value)));

    public readonly readonlyValue$ = this.ngControl$.pipe(
        switchMap(
            (control) =>
                control.valueChanges?.pipe(
                    startWith(control.value),
                    switchMap(() => {
                        const res = this._readOnlyValueFunction(control);

                        if (isObservable(res)) {
                            return res;
                        } else {
                            return of(res);
                        }
                    })
                ) ?? EMPTY
        )
    );

    public readonly status$ = merge(this._statusChanges$, this.ngControl$.pipe(map((control) => control.status))).pipe(
        map((s) => s as FormFieldStatus)
    );

    public readonly dirty$ = this.ngControl$.pipe(
        switchMap((ngControl) => ngControl.control?.events.pipe(startWith(ngControl.dirty)) ?? EMPTY),
        filter((event) => event instanceof PristineChangeEvent),
        map((event) => !event.pristine)
    );

    public readonly touched$ = this.ngControl$.pipe(
        switchMap((ngControl) => ngControl.control?.events.pipe(startWith(ngControl?.touched)) ?? EMPTY),
        filter((event) => event instanceof TouchedChangeEvent),
        map((event) => !event.touched)
    );

    public readonly displayAsInvalid$ = combineLatest([this.status$, this.ngControl$]).pipe(
        map(([status, ngControl]) => {
            const hideInvalidIfUntouched = this.config?.hideInvalidIfUntouched ?? false;
            const allowDisplayAsInvalid = hideInvalidIfUntouched ? ngControl.touched : true;
            const invalid = status === 'INVALID';
            return invalid && allowDisplayAsInvalid;
        }),
        startWith(false)
    );

    public readonly isRequired$ = this.ngControl$.pipe(
        switchMap((ngControl) =>
            this.status$.pipe(
                map(
                    (_) =>
                        !(this.config.shouldShowOptionalFlagFn ?? FORM_FIELD_CONFIG_DEFAULTS.shouldShowOptionalFlagFn)(
                            ngControl
                        )
                )
            )
        )
    );

    public readonly errors$ = combineLatest([this.ngControl$, this.displayAsInvalid$]).pipe(
        map(([ngControl, displayAsInvalid]) => {
            if (!displayAsInvalid) {
                return null;
            }

            return ngControl.errors;
        })
    );

    public readonly ariaDescription$ = this._ariaDescriptionSubject.asObservable();

    /** The placeholder as defined on the form field control */
    public readonly elementPlaceholder$ = this._elementPlaceholderSubject.asObservable();

    /** Represents the label of the field */
    public readonly labelAsPlaceholder$ = this._labelAsPlaceholderSubject.asObservable();

    /** A control-specific placeholder that should only be visible when focused (Used by directives such as date-input) */
    public readonly focusedPlaceholder$ = this._focusedPlaceholderSubject.asObservable();

    /** The actual placeholder that should be displayed, switches between label and specified placeholders depending on the control state  */
    public readonly placeholder$ = combineLatest([
        this.labelAsPlaceholder$,
        this.elementPlaceholder$,
        this.focusedPlaceholder$,
        this._elementSubject,
    ]).pipe(
        switchMap(([label, elementPlaceholder, focusedPlaceholder, element]) => {
            if (!element) {
                // Initial fallback
                return of(label || elementPlaceholder);
            }

            const focus$ = fromEvent(element, 'focus');
            const blur$ = fromEvent(element, 'blur');

            // Displays the label as placeholder, until focused, then switches to actual placeholder (if defined)
            return merge(
                of(label || elementPlaceholder),
                focus$.pipe(
                    // When focused, display the current placeholder.
                    map(() =>
                        elementPlaceholder && elementPlaceholder !== label
                            ? elementPlaceholder
                            : focusedPlaceholder || elementPlaceholder || label
                    )
                ),
                blur$.pipe(
                    // When blurred, display the label text if available.
                    map(() => label || elementPlaceholder || '')
                )
            );
        }),
        // the " " whitespace string fallback is a workaround, so the placeholder-shown style applies properly.
        map((placeholder) => placeholder || ' '),
        shareReplay({ refCount: true, bufferSize: 1 })
    );

    public readonly invalid$ = this.status$.pipe(map((status) => status === 'INVALID'));

    public readonly disabled$ = this.status$.pipe(map((status) => status === 'DISABLED'));
    public readonly pending$ = this.status$.pipe(
        combineLatestWith(this.loading$),
        map(([status, loading]) => status === 'PENDING' || loading === true)
    );
    public readonly errorsTranslationKeys$ = this.errors$.pipe(map(this.config.mapErrorsToTranslationParamsFn));

    public readonly element$ = this._elementSubject.asObservable();

    constructor() {
        if (this.config?.behaviors) {
            const destroyRef = inject(DestroyRef);
            for (const behavior of this.config.behaviors) {
                const subscription = behavior(this);
                if (subscription) {
                    destroyRef.onDestroy(() => subscription.unsubscribe());
                }
            }
        }
    }

    public getElementPlaceholder() {
        return this._elementPlaceholderSubject.value;
    }

    /** Set the user defined placeholder */
    public setElementPlaceholder(value: string) {
        this._elementPlaceholderSubject.next(value);
    }

    public getFocusedPlaceholder() {
        return this._focusedPlaceholderSubject.value;
    }

    /**
     * Set a placeholder as a fallback, displayed as long as the field itself has no custom placeholder.
     * This placeholder will only be displayed when focused.
     */
    public setFocusedPlaceholder(value: string) {
        this._focusedPlaceholderSubject.next(value);
    }

    /**
     * Returns the text for the current label, only if it is not always visible.
     */
    public getLabelAsPlaceholder() {
        return this._labelAsPlaceholderSubject.value;
    }

    /**
     * Notifies the field of the current label, so it can for example be displayed as a placeholder.
     **/
    public setLabelAsPlaceholder(value: string) {
        this._labelAsPlaceholderSubject.next(value);
    }

    public registerNgControl(ngControl: NgControl, element: HTMLElement) {
        this._ngControlSubject.next(ngControl);
        this._elementSubject.next(element);

        // This is a hack to fix the initial pending state: https://github.com/angular/angular/issues/41519
        // Potential cause of future problems...
        setTimeout(() => {
            if (ngControl.status === 'PENDING') {
                ngControl.control?.updateValueAndValidity();
            }
        });
    }

    private _readOnlyValueFunction: (control?: NgControl) => undefined | string | Observable<string> = (
        control?: NgControl
    ) => {
        switch (typeof control?.value) {
            case 'number':
                return this._decimalPipe.transform(control.value);
            case 'object':
                if (control.value instanceof File) {
                    return control.value.name;
                }

                return control.value;
            case 'string':
            default:
                return control?.value;
        }
    };

    public setReadonlyValueFunction(functionReference: () => string | Observable<string>) {
        this._readOnlyValueFunction = functionReference;
    }

    public setAriaDescription(description: string) {
        this._ariaDescriptionSubject.next(description);
    }

    public get id$() {
        return this._idSubject.asObservable();
    }

    public setId(value: string) {
        this._idSubject.next(value);
    }

    public get loading$() {
        return this._loadingSubject.asObservable();
    }

    public setLoading(value: boolean) {
        this._loadingSubject.next(value);
    }

    public get icon$() {
        return this._iconSubject.asObservable();
    }

    public setIcon(value: FormFieldIconConfig) {
        this._iconSubject.next(value);
    }

    public get clearable$() {
        return this._clearableSubject.asObservable();
    }

    public setClearable(value: boolean) {
        this._clearableSubject.next(value);
    }

    public updateIcon(value: Partial<FormFieldIconConfig>) {
        this._iconSubject.next({ ...this._iconSubject.value, ...value } as FormFieldIconConfig);
    }

    public get iconClick$() {
        return this._iconClickEmitter.asObservable();
    }

    public emitIconClick(event: MouseEvent) {
        this._iconClickEmitter.emit(event);
    }

    public get clear$() {
        return this._clearEmitter.asObservable();
    }

    public emitClear() {
        this._clearEmitter.emit();
    }

    public get overlayText$() {
        return this._overlayTextSubject.asObservable();
    }

    /**
     * Allows to display a text to be overlayed over the existing field using absolute positioning.
     *
     * An example where this is useful, is the file-input, which hides the actual underlying input field and renders the selected value on top.
     **/
    public setOverlayText(value: FormFieldOverlayTextConfig) {
        this._overlayTextSubject.next(value);
    }

    /**
     * Allows to update the overlay text values without overwriting the existing values.
     *
     * An example where this is useful, is the file-input, which updates the text when the file changes or when the input is focused.
     **/
    public updateOverlayText(value: Partial<FormFieldOverlayTextConfig>) {
        this._overlayTextSubject.next({ ...this._overlayTextSubject.value, ...value } as FormFieldOverlayTextConfig);
    }

    public ngOnDestroy(): void {
        this._ngControlSubject.complete();
        this._idSubject.complete();
        this._loadingSubject.complete();
        this._iconSubject.complete();
        this._overlayTextSubject.complete();
        this._elementPlaceholderSubject.complete();
        this._labelAsPlaceholderSubject.complete();
        this._focusedPlaceholderSubject.complete();
    }

    public markAsTouched() {
        const ngControl = this._ngControlSubject.getValue();

        if (ngControl?.control) {
            ngControl.control.markAsTouched();
            ngControl.control.updateValueAndValidity();
        }
    }
}
