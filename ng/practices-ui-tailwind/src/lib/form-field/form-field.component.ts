import { AsyncPipe, NgClass, NgComponentOutlet } from '@angular/common';
import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    ContentChild,
    HostBinding,
    Input,
    computed,
    inject,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { PuiFormFieldDirective, PuiReadonlyDirective } from '@nexplore/practices-ng-forms';
import { TranslateModule } from '@ngx-translate/core';
import {
    BehaviorSubject,
    combineLatest,
    combineLatestWith,
    filter,
    fromEvent,
    map,
    of,
    shareReplay,
    startWith,
    switchMap,
    take,
} from 'rxjs';
import { PuiIconCloseComponent } from '../icons/icon-close.component';
import { PuiIconInvalidComponent } from '../icons/icon-invalid.component';
import { PuiIconSpinnerComponent } from '../icons/icon-spinner.component';
import { PuiReadonyLabelValueComponent } from '../readonly-label-value/readonly-label-value.component';
import { FormFieldIconConfig, FormFieldService } from './form-field.service';
import { PuiLabelDirective } from './label.directive';

const className = 'block';

const iconContainerDefaultClassName =
    'absolute right-[2px] top-[2px] z-10 flex h-[calc(var(--spacing-pui-controlsize)-4px))] items-center';
const iconDefaultClassName = 'h-8 w-8 mb-[2px] mr-4';
const iconFilledClassName =
    'w-pui-controlsize h-pui-controlsize -mr-[2px] mt-0 border-t border-r border-b border-bordercontrol';
const iconInvertedClassName = 'bg-controlbutton-inverted fill-white';

const overlayTextDefaultClassName =
    'pr-pui-controlsize pl-6 h-pui-controlsize border border-bordercontrol w-full flex items-center pointer-events-none cursor-default absolute top-0 text-foreground';
const overlayTextInvalidClassName = 'border-red border-l-pui-controlinvalidbordersize';
const overlayTextDisabledClassName = 'bg-light-gray';
const overlayTextFocusClassName = 'border-2 rounded';
const overlayTextEmptyUntouchedAndValidClassName = 'border-opacity-60';
const overlayTextFilledClassName = 'border-l-pui-controlinvalidbordersize';
const overlayTextEmptyClassName = 'text-opacity-60';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        PuiIconInvalidComponent,
        PuiIconSpinnerComponent,
        PuiIconCloseComponent,
        PuiReadonyLabelValueComponent,
        NgClass,
        AsyncPipe,
        TranslateModule,
        NgComponentOutlet,
    ],
    hostDirectives: [PuiFormFieldDirective],
    selector: 'pui-form-field',
    standalone: true,
    templateUrl: './form-field.component.html',
})
export class PuiFormFieldComponent implements AfterViewInit {
    private _formFieldService = inject(FormFieldService);
    private readonly _readonlyDirective = inject(PuiReadonlyDirective, { optional: true });

    isReadonly$ = this._readonlyDirective?.isReadonly$ ?? of(false);
    labelString: string;
    protected readonly ngControlValueSignal = toSignal(this._formFieldService.readonlyValue$);
    protected readonly hasValueSignal = computed(() => {
        const value = this.ngControlValueSignal();
        if (value || (value as unknown) === 0) {
            return true;
        }

        return false;
    });

    private readonly _hideOptionalSubject = new BehaviorSubject<boolean>(false);
    private readonly _inputEvent$ = this._formFieldService.element$.pipe(
        filter((el) => !!el),
        switchMap((el) => fromEvent<InputEvent>(el, 'input')),
    );

    @Input()
    useSmallTextForReadonlyLabel: boolean | null = null;

    @Input()
    set hideOptional(value: boolean) {
        this._hideOptionalSubject.next(value);
    }

    @Input()
    readonlyEmptyValuePlaceholder: string;

    @ContentChild(PuiLabelDirective) label: PuiLabelDirective;

    @HostBinding('class')
    className = className;

    id$ = this._formFieldService.id$;
    isOptional$ = this._formFieldService.isRequired$.pipe(
        combineLatestWith(this._hideOptionalSubject),
        map(([isRequired, hideOptional]) => !isRequired && !hideOptional),
    );
    invalid$ = this._formFieldService.status$.pipe(map((status) => status === 'INVALID'));
    displayAsInvalid$ = this._formFieldService.displayAsInvalid$;
    disabled$ = this._formFieldService.status$.pipe(map((status) => status === 'DISABLED'));
    pending$ = this._formFieldService.status$.pipe(
        combineLatestWith(this._formFieldService.loading$),
        map(([status, loading]) => status === 'PENDING' || loading === true),
    );

    iconComponent$ = this._formFieldService.icon$.pipe(map((cf) => cf?.component));

    showCustomIcon$ = this._formFieldService.icon$.pipe(
        combineLatestWith(this.invalid$, this.pending$),
        map(([cf, invalid, pending]) => cf && (cf.showOnlyIfValid ? !invalid && !pending : true)),
    );

    iconClickable$ = this._formFieldService.icon$.pipe(
        combineLatestWith(this.showCustomIcon$, this.disabled$),
        map(([cf, showCustomIcon, disabled]) => showCustomIcon && !disabled && cf && cf.clickable),
    );

    isClearable$ = this._formFieldService.clearable$.pipe(
        combineLatestWith(this.disabled$),
        map(([clearable, disabled]) => clearable && !disabled),
    );

    iconClassName = iconDefaultClassName;

    isCustomIconFilled$ = this._formFieldService.icon$.pipe(map((cf) => cf?.fill));

    customIconClassName$ = this._formFieldService.icon$.pipe(
        combineLatestWith(this.showCustomIcon$, this.displayAsInvalid$, this.disabled$),
        map(([cf, canShow, displayAsInvalid, disabled]) =>
            canShow && cf ? this._getCustomIconClassName(displayAsInvalid, disabled, cf) : '',
        ),
    );

    customIconClickable$ = this._formFieldService.icon$.pipe(map((icon) => icon?.clickable));

    customIconTitle$ = this._formFieldService.icon$.pipe(map((icon) => icon?.title));

    overlayTextValue$ = this._formFieldService.overlayText$.pipe(map((cf) => cf?.text));

    ariaDescription$ = this._formFieldService.ariaDescription$;

    overlayTextClassName$ = combineLatest([
        this._formFieldService.overlayText$,
        this._formFieldService.value$,
        this.displayAsInvalid$,
        this.disabled$,
    ]).pipe(
        map(([cf, value, invalid, disabled]) =>
            cf ? this._getOverlayTextClassName(invalid, disabled, cf.isFocused, value) : '',
        ),
    );

    iconContainerClassName$ = combineLatest([this.displayAsInvalid$, this.customIconClickable$, this.disabled$]).pipe(
        map(([invalid, clickable, disabled]) => this._getIconContainerClassName(invalid, clickable, disabled)),
    );

    errors$ = this._formFieldService.errors$.pipe(
        map((errors) => {
            if (errors == null) {
                return [];
            }

            return Object.entries(errors)
                .map(([key, value]) => [this.capitalizeFirstLetter(key), value] as const)
                .map(([key, value]) => ({
                    key: `Messages.Validation_${key}`,
                    param: value,
                }));
        }),
    );

    readonly dirty$ = this._formFieldService.dirty$;
    readonly touched$ = this._formFieldService.touched$;

    /**
     * Returns true if the label should be shown above the form field, while the field has a value or if has a custom placeholder
     */
    readonly shouldShowLabelAboveField$ = combineLatest([
        this._formFieldService.value$.pipe(startWith(null)),
        this._inputEvent$.pipe(startWith(null)),
        this._formFieldService.placeholder$,
        this._formFieldService.labelAsPlaceholder$,
    ]).pipe(
        map(
            ([value, inputEvent, placeholder, label]) =>
                !!value || (inputEvent?.target as HTMLInputElement)?.value || (placeholder && placeholder !== label),
        ),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );

    ngAfterViewInit() {
        this.labelString = this.label?.getLabel();
    }

    onClear() {
        this.isClearable$.pipe(take(1)).subscribe((clearable) => {
            if (clearable) {
                this._formFieldService.emitClear();
            }
        });
    }

    onIconClick(event: MouseEvent) {
        this.iconClickable$.pipe(take(1)).subscribe((clickable) => {
            if (clickable) {
                this._formFieldService.emitIconClick(event);
            }
        });
    }

    private _getCustomIconClassName(invalid: boolean, disabled: boolean, cf?: FormFieldIconConfig): string {
        return (
            (cf?.className ?? '') +
            ' ' +
            (cf?.fill ? iconFilledClassName + (invalid ? ' ' + 'border-red' : '') : iconDefaultClassName) +
            (cf?.clickable && !disabled
                ? ' cursor-pointer ' +
                  (cf?.invert ? 'hover:bg-controlbutton-inverted-hover' : 'hover:bg-controlbutton-hover')
                : '') +
            (cf?.invert ? ' ' + iconInvertedClassName : '')
        );
    }

    private _getIconContainerClassName(invalid: boolean, clickable: boolean, disabled: boolean): string {
        return (
            iconContainerDefaultClassName +
            ' ' +
            (invalid ? 'border-red' : '') +
            ' ' +
            (disabled ? 'bg-light-gray' : 'bg-white') +
            ' ' +
            (clickable ? '' : 'pointer-events-none')
        );
    }

    private _getOverlayTextClassName(invalid: boolean, disabled: boolean, focus: boolean, value: string): string {
        return (
            overlayTextDefaultClassName +
            ' ' +
            (invalid ? overlayTextInvalidClassName : '') +
            ' ' +
            (disabled ? overlayTextDisabledClassName : '') +
            ' ' +
            (focus ? overlayTextFocusClassName : '') +
            ' ' +
            (!value && !focus && !invalid ? overlayTextEmptyUntouchedAndValidClassName : '') +
            ' ' +
            (value ? overlayTextFilledClassName : overlayTextEmptyClassName)
        );
    }

    private capitalizeFirstLetter(value: string) {
        return value.charAt(0).toUpperCase() + value.slice(1);
    }
}

