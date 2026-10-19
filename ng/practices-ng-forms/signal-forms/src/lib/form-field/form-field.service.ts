import { DecimalPipe } from '@angular/common';
import { computed, DestroyRef, EventEmitter, inject, Injectable, OnDestroy, signal, Type } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import type { ValidationErrors } from '@angular/forms';
import type { FieldState, FormField } from '@angular/forms/signals';
import {
    BehaviorSubject,
    combineLatest,
    combineLatestWith,
    distinctUntilChanged,
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
import { toValidationErrors } from '../error-model';
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

    private readonly _formFieldSignal = signal<FormField<unknown> | null>(null);
    private readonly _elementSubject = new BehaviorSubject<HTMLElement | null>(null);
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

    /** The signal forms state of the registered field (`undefined` until a form field is registered). */
    public readonly stateSignal = computed<FieldState<unknown> | undefined>(() => this._formFieldSignal()?.state());

    public readonly valueSignal = computed(() => this.stateSignal()?.value());
    public readonly statusSignal = computed<FormFieldStatus>(() => {
        const state = this.stateSignal();
        if (!state) {
            return 'NONE';
        }
        return state.disabled() ? 'DISABLED' : state.invalid() ? 'INVALID' : state.pending() ? 'PENDING' : 'VALID';
    });
    public readonly dirtySignal = computed(() => !!this.stateSignal()?.dirty());
    public readonly touchedSignal = computed(() => !!this.stateSignal()?.touched());
    public readonly requiredSignal = computed(() => {
        const state = this.stateSignal();
        return state ? !this.config.shouldShowOptionalFlagFn(state) : false;
    });
    public readonly displayAsInvalidSignal = computed(() => {
        const hideInvalidIfUntouched = this.config?.hideInvalidIfUntouched ?? false;
        const allowDisplayAsInvalid = hideInvalidIfUntouched ? this.touchedSignal() : true;
        return this.statusSignal() === 'INVALID' && allowDisplayAsInvalid;
    });
    public readonly errorsSignal = computed<ValidationErrors | null>(() => {
        const state = this.stateSignal();
        if (!state || !this.displayAsInvalidSignal()) {
            return null;
        }
        return toValidationErrors(state.errors(), state.value());
    });

    /** Emits once the form field is registered (and again if it changes). */
    public readonly formFieldState$ = toObservable(this.stateSignal).pipe(
        distinctUntilChanged(),
        map((state) => state as FieldState<unknown>)
    );

    public readonly value$ = toObservable(this.valueSignal);

    public readonly readonlyValue$ = toObservable(this.valueSignal).pipe(
        switchMap(() => {
            const res = this._readOnlyValueFunction(this.stateSignal());

            if (isObservable(res)) {
                return res;
            } else {
                return of(res);
            }
        })
    );

    public readonly status$ = toObservable(this.statusSignal);
    public readonly dirty$ = toObservable(this.dirtySignal);
    public readonly touched$ = toObservable(this.touchedSignal);
    public readonly displayAsInvalid$ = toObservable(this.displayAsInvalidSignal).pipe(startWith(false));
    public readonly isRequired$ = toObservable(this.requiredSignal);
    public readonly errors$ = toObservable(this.errorsSignal);

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

    /**
     * Registers the `[formField]` directive (and its element) that this form field wraps.
     * Called by the `[formField]` extension directive of this library.
     */
    public registerFormField(formField: FormField<unknown>, element: HTMLElement) {
        this._formFieldSignal.set(formField);
        this._elementSubject.next(element);
    }

    private _readOnlyValueFunction: (state?: FieldState<unknown>) => undefined | string | Observable<string> = (
        state?: FieldState<unknown>
    ) => {
        const value = state?.value();
        switch (typeof value) {
            case 'number':
                return this._decimalPipe.transform(value);
            case 'object':
                if (value instanceof File) {
                    return value.name;
                }

                return value as any;
            case 'string':
            default:
                return value as any;
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
        this._elementSubject.complete();
        this._idSubject.complete();
        this._loadingSubject.complete();
        this._iconSubject.complete();
        this._overlayTextSubject.complete();
        this._elementPlaceholderSubject.complete();
        this._labelAsPlaceholderSubject.complete();
        this._focusedPlaceholderSubject.complete();
    }

    public markAsTouched() {
        this.stateSignal()?.markAsTouched({ skipDescendants: true });
    }
}
