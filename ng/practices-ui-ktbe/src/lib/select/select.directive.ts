import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Directive,
    ElementRef,
    HostBinding,
    HostListener,
    Inject,
    Input,
    OnInit,
    Optional,
    Self,
    ViewContainerRef,
    ViewEncapsulation,
} from '@angular/core';
import { NgControl } from '@angular/forms';
import { trace } from '@nexplore/practices-ng-logging';
import { DestroyService } from '@nexplore/practices-ui';
import { NgSelectComponent } from '@ng-select/ng-select';
import { TranslateService } from '@ngx-translate/core';
import { takeUntil } from 'rxjs';
import { FormFieldService } from '../form-field/form-field.service';
import { FORM_CONFIG, FormConfig } from '../form/form.config';
import { PuibeIconArrowComponent } from '../icons/icon-arrow.component';
import { PuibeIconSearchComponent } from '../icons/icon-search.component';
import { isDefinedAndNotEmptyArray, setAttr, setHostClassNames } from '../util/utils';

const baseArrowIconClassName = 'transition-transform duration-300 ease-in-out flex flex-col justify-center scale-50';
const arrowDownIconClassName = `${baseArrowIconClassName} rotate-0`;
const arrowUpIconClassName = `${baseArrowIconClassName} -rotate-180`;

@Component({
    standalone: true,
    selector: 'puibe-select-deep-style-component',
    styleUrls: ['./select.directive.css'],
    template: '',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PuibeSelectDeepStyleComponent {
    @HostBinding('attr.aria-hidden')
    ariaHidden = 'true';
}

@Directive({
    standalone: true,
    selector: 'ng-select[puibeInput]',
    providers: [DestroyService],
})
export class PuibeSelectDirective implements OnInit, AfterViewInit {
    @HostListener('blur')
    onBlur() {
        this._formFieldService.markAsTouched();
    }

    @HostListener('open')
    onOpen() {
        if (!this.useSearchIconIfSearchable || !this._ngSelectComponent.searchable) {
            this._formFieldService.updateIcon({ className: arrowUpIconClassName });
        }
    }

    @HostListener('close')
    onClose() {
        if (!this.useSearchIconIfSearchable || !this._ngSelectComponent.searchable) {
            this._formFieldService.updateIcon({ className: arrowDownIconClassName });
        }
    }

    @Input()
    set loading(value: boolean) {
        this._formFieldService.setLoading(value);
    }

    @Input('aria-describedby')
    ariaDescribedby: string;

    @Input()
    set placeholder(value: string) {
        this._formFieldService.setElementPlaceholder(value);
    }

    get placeholder(): string {
        return this._formFieldService.getElementPlaceholder();
    }

    @Input()
    useSearchIconIfSearchable: boolean = this._config?.useSearchIconIfSelectSearchable ?? false;

    constructor(
        private _elementRef: ElementRef<HTMLElement>,
        private _viewContainerRef: ViewContainerRef,
        @Self() private _ngControl: NgControl,
        @Self() private _ngSelectComponent: NgSelectComponent,
        private _formFieldService: FormFieldService,
        private _destroy$: DestroyService,
        private _cdr: ChangeDetectorRef,
        private _translate: TranslateService,
        @Optional() @Inject(FORM_CONFIG) private readonly _config: FormConfig
    ) {}

    ngOnInit() {
        this._viewContainerRef.createComponent(PuibeSelectDeepStyleComponent);

        this._formFieldService.registerNgControl(
            this._ngControl,
            this._ngSelectComponent.searchInput?.nativeElement ?? this._elementRef.nativeElement
        );
        this._formFieldService.setReadonlyValueFunction(() => this.getReadOnlyValue());

        this._formFieldService.id$.pipe(takeUntil(this._destroy$)).subscribe((id) => {
            this._ngSelectComponent.labelForId = id;
            setAttr('autocomplete', 'off', this.ngSelectInputElement());

            const ariaDescribedByError = `${id}-error`;
            const ariaDescribedByCustom = `${id}-description`;

            const ids = [this.ariaDescribedby, ariaDescribedByError, ariaDescribedByCustom].filter(Boolean).join(' ');
            setAttr('aria-describedby', ids, this.ngSelectInputElement());
        });
        this._formFieldService.isRequired$
            .pipe(takeUntil(this._destroy$))
            .subscribe((isRequired) => setAttr('required', isRequired, this.ngSelectInputElement()));
        this._formFieldService.loading$
            .pipe(takeUntil(this._destroy$))
            .subscribe((loading) => setHostClassNames({ 'puibe-loading': loading }, this._elementRef));
        this._formFieldService.displayAsInvalid$
            .pipe(takeUntil(this._destroy$))
            .subscribe((displayAsInvalid) =>
                setHostClassNames({ 'puibe-hide-invalid': !displayAsInvalid }, this._elementRef)
            );

        // Displays the label as placeholder, until focused, then switches to actual placeholder (if defined)
        this._formFieldService.placeholder$.pipe(takeUntil(this._destroy$)).subscribe((placeholder) => {
            this._ngSelectComponent.placeholder = placeholder;
            this._cdr.markForCheck();
        });

        if (!this._ngSelectComponent.selectedValues?.length) {
            // If there is an item with a `null` value, select it initially
            const nullItem = this._ngSelectComponent.itemsList.findItem(null);
            if (nullItem) {
                this._ngSelectComponent.select(nullItem);
            }
        }

        // Handle case where the model is set to null programmatically
        this._ngControl.valueChanges?.pipe(takeUntil(this._destroy$)).subscribe((value) => {
            if (value === null) {
                const nullItem = this._ngSelectComponent.itemsList.findItem(null);
                if (nullItem) {
                    trace('SelectDirective', 'handle null value', 'selecting null item', this, {
                        nullItem,
                        value,
                    });
                    this._ngSelectComponent.select(nullItem);
                }
            }
        });

        this._formFieldService.readonlyValue$.pipe(takeUntil(this._destroy$)).subscribe((value) => {
            // Using ng-select with a screenreader does not read out the currently selected value, so we need to set the aria-label.
            const label = this.ngSelectInputElement()?.labels[0]?.innerText;
            this.ngSelectInputElement().ariaLabel = label ? `${label} ${value}` : value;
        });

        if (this._ngSelectComponent.clearable) {
            this._formFieldService.value$.pipe(takeUntil(this._destroy$)).subscribe((value) => {
                this._formFieldService.setClearable(isDefinedAndNotEmptyArray(value));
            });
        }

        this._formFieldService.clear$
            .pipe(takeUntil(this._destroy$))
            .subscribe(() => this._ngSelectComponent.handleClearClick());
    }

    ngAfterViewInit() {
        // This need to be done after view init, because the select-view-source directive set searchable at on init
        this._formFieldService.setIcon({
            component:
                this.useSearchIconIfSearchable && this._ngSelectComponent.searchable
                    ? PuibeIconSearchComponent
                    : PuibeIconArrowComponent,
            className:
                this.useSearchIconIfSearchable && this._ngSelectComponent.searchable ? '' : arrowDownIconClassName,
        });

        if (this._ngSelectComponent.searchable) {
            this._formFieldService.setFocusedPlaceholder(this._translate.instant('Practices.Labels_Select_SearchText'));
        }
    }

    getReadOnlyValue() {
        // ngSelect usually only return the id as value
        // find the correspondig label and format a string
        let selectedValuesString = '';
        // get all labels of selected values
        this._ngSelectComponent.selectedValues.forEach(
            (elem, index) =>
                (selectedValuesString +=
                    (index > 0 ? ', ' : '') + (elem[this._ngSelectComponent.bindLabel ?? 'label'] || ''))
        );
        return selectedValuesString;
    }

    private ngSelectInputElement() {
        return this._elementRef.nativeElement.querySelector('input');
    }
}
