import { AsyncPipe, NgClass, NgComponentOutlet, NgFor, NgIf } from '@angular/common';
import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    ContentChild,
    HostBinding,
    Input,
    Optional,
} from '@angular/core';
import { PuiFormFieldDirective } from '@nexplore/practices-ng-forms';
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
import { PuibeReadonlyDirective } from '../common/readonly.directive';
import { PuibeIconCloseComponent } from '../icons/icon-close.component';
import { PuibeIconInvalidComponent } from '../icons/icon-invalid.component';
import { PuibeIconSpinnerComponent } from '../icons/icon-spinner.component';
import { PuibeReadonlyLabelValueComponent } from '../readonly-label-value/readonly-label-value.component';
import { FormFieldIconConfig, FormFieldService } from './form-field.service';
import { PuibeLabelDirective } from './label.directive';

const className = 'block';

const iconContainerDefaultClassName = 'absolute right-[2px] top-[2px] z-10 flex h-[56px] items-center';
const iconDefaultClassName = 'h-8 w-8 mb-[2px] mr-4';
const iconFilledClassName = 'w-ktbe-15 h-ktbe-15 -mr-[2px] mt-0 border-t border-r border-b';
const iconInvertedClassName = 'bg-dark-gray fill-white';

const overlayTextDefaultClassName =
    'pr-ktbe-15 pl-6 h-ktbe-15 border w-full flex items-center pointer-events-none cursor-default absolute top-0 border-black text-black';
const overlayTextInvalidClassName = 'border-red border-l-ktbe-6';
const overlayTextDisabledClassName = 'bg-light-gray';
const overlayTextFocusClassName = 'border-2 rounded';
const overlayTextEmptyUntouchedAndValidClassName = 'border-opacity-60';
const overlayTextFilledClassName = 'border-l-ktbe-6';
const overlayTextEmptyClassName = 'text-opacity-60';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        PuibeIconInvalidComponent,
        PuibeIconSpinnerComponent,
        PuibeIconCloseComponent,
        PuibeReadonlyLabelValueComponent,
        NgIf,
        NgFor,
        NgClass,
        AsyncPipe,
        TranslateModule,
        NgComponentOutlet,
    ],
    hostDirectives: [PuiFormFieldDirective],
    selector: 'puibe-form-field',
    standalone: true,
    templateUrl: './form-field.component.html',
})
export class PuibeFormFieldComponent implements AfterViewInit {
    isReadonly$ = this._readonlyDirective?.isReadonly$ ?? of(false);
    labelString: string;
    readonly ngControlValue$ = this._formFieldService.readonlyValue$;

    private readonly _hideOptionalSubject = new BehaviorSubject<boolean>(false);
    private readonly _inputEvent$ = this._formFieldService.element$.pipe(
        filter((el) => !!el),
        switchMap((el) => fromEvent<InputEvent>(el, 'input'))
    );

    @Input()
    useSmallTextForReadonlyLabel: boolean | null = null;

    @Input()
    set hideOptional(value: boolean) {
        this._hideOptionalSubject.next(value);
    }

    @Input()
    readonlyEmptyValuePlaceholder: string;

    @ContentChild(PuibeLabelDirective) label: PuibeLabelDirective;

    @HostBinding('class')
    className = className;

    id$ = this._formFieldService.id$;
    isOptional$ = this._formFieldService.isRequired$.pipe(
        combineLatestWith(this._hideOptionalSubject),
        map(([isRequired, hideOptional]) => !isRequired && !hideOptional)
    );
    invalid$ = this._formFieldService.status$.pipe(map((status) => status === 'INVALID'));
    displayAsInvalid$ = this._formFieldService.displayAsInvalid$;
    disabled$ = this._formFieldService.status$.pipe(map((status) => status === 'DISABLED'));
    pending$ = this._formFieldService.status$.pipe(
        combineLatestWith(this._formFieldService.loading$),
        map(([status, loading]) => status === 'PENDING' || loading === true)
    );

    iconComponent$ = this._formFieldService.icon$.pipe(map((cf) => cf?.component));

    showCustomIcon$ = this._formFieldService.icon$.pipe(
        combineLatestWith(this.invalid$, this.pending$),
        map(([cf, invalid, pending]) => cf && (cf.showOnlyIfValid ? !invalid && !pending : true))
    );

    iconClickable$ = this._formFieldService.icon$.pipe(
        combineLatestWith(this.showCustomIcon$, this.disabled$),
        map(([cf, showCustomIcon, disabled]) => showCustomIcon && !disabled && cf && cf.clickable)
    );

    isClearable$ = this._formFieldService.clearable$.pipe(
        combineLatestWith(this.disabled$),
        map(([clearable, disabled]) => clearable && !disabled)
    );

    iconClassName = iconDefaultClassName;

    isCustomIconFilled$ = this._formFieldService.icon$.pipe(map((cf) => cf?.fill));

    customIconClassName$ = this._formFieldService.icon$.pipe(
        combineLatestWith(this.showCustomIcon$, this.displayAsInvalid$, this.disabled$),
        map(([cf, canShow, displayAsInvalid, disabled]) =>
            canShow && cf ? this._getCustomIconClassName(displayAsInvalid, disabled, cf) : ''
        )
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
            cf ? this._getOverlayTextClassName(invalid, disabled, cf.isFocused, value) : ''
        )
    );

    iconContainerClassName$ = combineLatest([this.displayAsInvalid$, this.customIconClickable$, this.disabled$]).pipe(
        map(([invalid, clickable, disabled]) => this._getIconContainerClassName(invalid, clickable, disabled))
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
        })
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
                !!value || (inputEvent?.target as HTMLInputElement)?.value || (placeholder && placeholder !== label)
        ),
        shareReplay({ refCount: true, bufferSize: 1 })
    );

    constructor(
        private _formFieldService: FormFieldService,
        @Optional() private readonly _readonlyDirective: PuibeReadonlyDirective
    ) {}

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
                ? ' cursor-pointer ' + (cf?.invert ? 'hover:bg-anthrazit' : 'hover:bg-dark-gray-50')
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
