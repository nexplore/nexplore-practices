import { AsyncPipe, NgClass } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, ContentChildren, ElementRef, forwardRef, Injector, Input, QueryList, ViewEncapsulation, inject } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NgControl } from '@angular/forms';
import { PuiFormFieldDirective, PuiFormFieldService, PuiReadonlyDirective } from '@nexplore/practices-ng-forms';
import { DestroyService } from '@nexplore/practices-ui';
import { TranslateModule } from '@ngx-translate/core';
import { combineLatestWith, map, of, skip, takeUntil } from 'rxjs';
import { PuiIconInvalidComponent } from '../icons/icon-invalid.component';
import { PuiIconSpinnerComponent } from '../icons/icon-spinner.component';
import { PuiReadonyLabelValueComponent } from '../readonly-label-value/readonly-label-value.component';
import { RadioButtonGroupService } from './radio-button-group.service';
import { PuiRadioButtonComponent } from './radio-button.component';

@Component({
    standalone: true,
    selector: 'pui-radio-button-group',
    templateUrl: './radio-button-group.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
    NgClass,
    PuiIconInvalidComponent,
    AsyncPipe,
    TranslateModule,
    PuiIconSpinnerComponent,
    PuiReadonyLabelValueComponent
],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            multi: true,
            useExisting: forwardRef(() => PuiRadioButtonGroupComponent),
        },
        RadioButtonGroupService,
        DestroyService,
    ],
    hostDirectives: [PuiFormFieldDirective],
    styles: [
        `
            @reference '../../styles.css';
            pui-radio-button-group {
                @apply block;
            }
        `,
    ],
})
export class PuiRadioButtonGroupComponent implements ControlValueAccessor, AfterViewInit {
    private _radioButtonGroupService = inject(RadioButtonGroupService);
    private _formFieldService = inject(PuiFormFieldService);
    private _destroy$ = inject(DestroyService);
    private _injector = inject(Injector);
    private _elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly _readonlyDirective = inject(PuiReadonlyDirective, { optional: true });

    private _touched = false;

    @Input()
    useSmallTextForReadonlyLabel: boolean | null = null;

    @Input()
    set name(value: string) {
        this._radioButtonGroupService.setName(value);
    }

    @Input()
    set hideOptional(value: boolean) {
        this._radioButtonGroupService.setHideOptional(value);
    }

    @Input()
    legend: string;

    @Input()
    isLegendSrOnly = false;

    @Input()
    legendAsLabel = false;

    @Input()
    hint: string;

    @Input()
    displayInline = false;

    @Input()
    gapVariant: 'default' | 'large' = 'default';

    @Input()
    hideGroupBorder = false;

    @Input()
    readonlyEmptyValuePlaceholder: string;

    @ContentChildren(PuiRadioButtonComponent, { descendants: true })
    private radioButtons: QueryList<PuiRadioButtonComponent>;

    name$ = this._radioButtonGroupService.name$;

    readonly labelOfSelectedRadio$ = this._radioButtonGroupService.value$.pipe(
        map((value) => this.radioButtons.find((item) => item.value === value)?.label),
    );

    // TODO: Rethink naming of all these observables. They are confusing in the sense that they are not affecting the underlying
    //       form-controls, but rather the visual representation of the control. E.g. `isOptional$` should be `displayAsOptional$`
    //       At the same time, the `invalid$` observable maybe deleted, since it is not used anywhere.
    isOptional$ = this._radioButtonGroupService.isRequired$.pipe(
        combineLatestWith(this._radioButtonGroupService.hideOptional$),
        map(([isRequired, hideOptional]) => !isRequired && !hideOptional),
    );
    readonly isReadonly$ = this._readonlyDirective?.isReadonly$ ?? of(false);

    invalid$ = this._radioButtonGroupService.invalid$;
    displayAsInvalid$ = this._radioButtonGroupService.displayAsInvalid$;
    pending$ = this._radioButtonGroupService.pending$;

    dirty$ = this._radioButtonGroupService.elementState$.pipe(map((state) => state.dirty));

    errors$ = this._radioButtonGroupService.errors$.pipe(
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

    ngAfterViewInit(): void {
        const ngControl = this._injector.get(NgControl);
        if (ngControl.control) {
            this._radioButtonGroupService.registerNgControl(ngControl, this._elementRef.nativeElement);
            this._formFieldService.registerNgControl(ngControl, this._elementRef.nativeElement);
        }

        this._radioButtonGroupService.value$
            .pipe(skip(1), takeUntil(this._destroy$))
            .subscribe((_) => this.markAsTouched());
    }

    markAsTouched() {
        if (!this._touched) {
            if (this._onTouched) {
                this._onTouched();
            }
            this._touched = true;
        }
    }

    writeValue(_: any): void {}

    registerOnChange(onChange: (value: any) => void): void {
        this._radioButtonGroupService.registerOnChange(onChange);
    }

    private _onTouched = () => {};

    registerOnTouched(onTouched: any): void {
        this._onTouched = onTouched;
    }

    private capitalizeFirstLetter(value: string) {
        return value.charAt(0).toUpperCase() + value.slice(1);
    }
}

