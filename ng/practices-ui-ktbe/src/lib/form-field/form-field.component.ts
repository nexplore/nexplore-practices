import { AsyncPipe, NgClass, NgComponentOutlet, NgFor, NgIf } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    computed,
    contentChild,
    effect,
    ElementRef,
    Input,
    Optional,
    signal,
    viewChild,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
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
const fieldTopSpacingPx = 20;
const labelBadgeGapPx = 8;

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
    host: {
        class: className,
        '[style.padding-top]': 'hostPaddingTopSignal()',
    },
})
export class PuibeFormFieldComponent {
    public readonly isReadonly$ = this._readonlyDirective?.isReadonly$ ?? of(false);
    public readonly ngControlValue$ = this._formFieldService.readonlyValue$;

    private readonly _hideOptionalSubject = new BehaviorSubject<boolean>(false);
    private readonly _inputEvent$ = this._formFieldService.element$.pipe(
        filter((el) => !!el),
        switchMap((el) => fromEvent<InputEvent>(el, 'input'))
    );

    @Input()
    public useSmallTextForReadonlyLabel: boolean | null = null;

    @Input()
    public set hideOptional(value: boolean) {
        this._hideOptionalSubject.next(value);
    }

    @Input()
    public readonlyEmptyValuePlaceholder: string;

    protected readonly labelSignal = contentChild(PuibeLabelDirective);

    public get label(): PuibeLabelDirective | undefined {
        return this.labelSignal();
    }

    private readonly _optionalBadgeSignal = viewChild<ElementRef<HTMLElement>>('optionalBadge');

    private readonly _labelStringSignal = signal('');
    public readonly labelStringSignal = this._labelStringSignal.asReadonly();

    /**
     * @deprecated Use {@link labelStringSignal} instead. Kept for backwards compatibility.
     */
    public get labelString(): string {
        return this._labelStringSignal();
    }

    public id$ = this._formFieldService.id$;
    public isOptional$ = this._formFieldService.isRequired$.pipe(
        combineLatestWith(this._hideOptionalSubject),
        map(([isRequired, hideOptional]) => !isRequired && !hideOptional)
    );
    public invalid$ = this._formFieldService.status$.pipe(map((status) => status === 'INVALID'));
    public displayAsInvalid$ = this._formFieldService.displayAsInvalid$;
    public disabled$ = this._formFieldService.status$.pipe(map((status) => status === 'DISABLED'));
    public pending$ = this._formFieldService.status$.pipe(
        combineLatestWith(this._formFieldService.loading$),
        map(([status, loading]) => status === 'PENDING' || loading === true)
    );

    public iconComponent$ = this._formFieldService.icon$.pipe(map((cf) => cf?.component));

    public showCustomIcon$ = this._formFieldService.icon$.pipe(
        combineLatestWith(this.invalid$, this.pending$),
        map(([cf, invalid, pending]) => cf && (cf.showOnlyIfValid ? !invalid && !pending : true))
    );

    public iconClickable$ = this._formFieldService.icon$.pipe(
        combineLatestWith(this.showCustomIcon$, this.disabled$),
        map(([cf, showCustomIcon, disabled]) => showCustomIcon && !disabled && cf && cf.clickable)
    );

    public isClearable$ = this._formFieldService.clearable$.pipe(
        combineLatestWith(this.disabled$),
        map(([clearable, disabled]) => clearable && !disabled)
    );

    public iconClassName = iconDefaultClassName;

    public isCustomIconFilled$ = this._formFieldService.icon$.pipe(map((cf) => cf?.fill));

    public customIconClassName$ = this._formFieldService.icon$.pipe(
        combineLatestWith(this.showCustomIcon$, this.displayAsInvalid$, this.disabled$),
        map(([cf, canShow, displayAsInvalid, disabled]) =>
            canShow && cf ? this._getCustomIconClassName(displayAsInvalid, disabled, cf) : ''
        )
    );

    public customIconClickable$ = this._formFieldService.icon$.pipe(map((icon) => icon?.clickable));

    public customIconTitle$ = this._formFieldService.icon$.pipe(map((icon) => icon?.title));

    public overlayTextValue$ = this._formFieldService.overlayText$.pipe(map((cf) => cf?.text));

    public ariaDescription$ = this._formFieldService.ariaDescription$;

    public overlayTextClassName$ = combineLatest([
        this._formFieldService.overlayText$,
        this._formFieldService.value$,
        this.displayAsInvalid$,
        this.disabled$,
    ]).pipe(
        map(([cf, value, invalid, disabled]) =>
            cf ? this._getOverlayTextClassName(invalid, disabled, cf.isFocused, value) : ''
        )
    );

    public iconContainerClassName$ = combineLatest([
        this.displayAsInvalid$,
        this.customIconClickable$,
        this.disabled$,
    ]).pipe(map(([invalid, clickable, disabled]) => this._getIconContainerClassName(invalid, clickable, disabled)));

    public errors$ = this._formFieldService.errors$.pipe(
        map((errors) => {
            if (errors == null) {
                return [];
            }

            return Object.entries(errors)
                .map(([key, value]) => [this._capitalizeFirstLetter(key), value] as const)
                .map(([key, value]) => ({
                    key: `Messages.Validation_${key}`,
                    param: value,
                }));
        })
    );

    public readonly dirty$ = this._formFieldService.dirty$;
    public readonly touched$ = this._formFieldService.touched$;

    /**
     * Returns true if the label should be shown above the form field, while the field has a value or if has a custom placeholder
     */
    public readonly shouldShowLabelAboveField$ = combineLatest([
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

    private readonly _shouldShowLabelAboveFieldSignal = toSignal(this.shouldShowLabelAboveField$, {
        initialValue: false,
    });
    protected readonly hostPaddingTopSignal = computed(() => {
        const label = this.labelSignal();
        if (!label) {
            return '';
        }
        const floating = !!this._shouldShowLabelAboveFieldSignal() || label.alwaysVisibleSignal();
        const reserved = floating ? Math.max(fieldTopSpacingPx, label.heightSignal()) : fieldTopSpacingPx;
        return `${reserved}px`;
    });

    constructor(
        private _formFieldService: FormFieldService,
        private readonly _elementRef: ElementRef<HTMLElement>,
        @Optional() private readonly _readonlyDirective: PuibeReadonlyDirective
    ) {
        effect(() => {
            const label = this.labelSignal();
            if (label) {
                this._labelStringSignal.set(label.labelTextSignal());
            }
        });

        effect(() => {
            this.labelSignal()?.setShouldShowAbove(!!this._shouldShowLabelAboveFieldSignal());
        });

        effect((onCleanup) => {
            const badge = this._optionalBadgeSignal()?.nativeElement;
            const label = this.labelSignal();
            if (!badge || !label) {
                label?.setBoundaryRight(null);
                return;
            }

            const update = () => label.setBoundaryRight(badge.offsetLeft - labelBadgeGapPx);
            update();

            const observer = new ResizeObserver(update);
            observer.observe(this._elementRef.nativeElement);
            onCleanup(() => observer.disconnect());
        });
    }

    public onClear() {
        this.isClearable$.pipe(take(1)).subscribe((clearable) => {
            if (clearable) {
                this._formFieldService.emitClear();
            }
        });
    }

    public onIconClick(event: MouseEvent) {
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

    private _capitalizeFirstLetter(value: string) {
        return value.charAt(0).toUpperCase() + value.slice(1);
    }
}
