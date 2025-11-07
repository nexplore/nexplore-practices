import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Directive,
    ElementRef,
    HostBinding,
    HostListener,
    Input,
    OnInit,
    ViewContainerRef,
    ViewEncapsulation,
    inject,
} from '@angular/core';
import { NgControl } from '@angular/forms';
import { DestroyService } from '@nexplore/practices-ui';
import { NgSelectComponent } from '@ng-select/ng-select';
import { TranslateService } from '@ngx-translate/core';
import { takeUntil } from 'rxjs';
import { FormFieldService } from '../form-field/form-field.service';
import { FORM_CONFIG, FormConfig } from '../form/form.config';
import { PuiIconArrowComponent } from '../icons/icon-arrow.component';
import { PuiIconSearchComponent } from '../icons/icon-search.component';
import { isDefinedAndNotEmptyArray, setAttr, setHostClassNames } from '../util/utils';

const baseArrowIconClassName = 'transition-transform duration-300 ease-in-out flex flex-col justify-center scale-50';
const arrowDownIconClassName = `${baseArrowIconClassName} rotate-0`;
const arrowUpIconClassName = `${baseArrowIconClassName} -rotate-180`;

@Component({
    standalone: true,
    selector: 'pui-select-deep-style-component',
    styleUrls: ['./select.directive.css'],
    template: '',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PuiSelectDeepStyleComponent {
    @HostBinding('attr.aria-hidden')
    ariaHidden = 'true';
}

@Directive({
    standalone: true,
    selector: 'ng-select[puiInput]',
    providers: [DestroyService],
})
export class PuiSelectDirective implements OnInit, AfterViewInit {
    private _elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private _viewContainerRef = inject(ViewContainerRef);
    private _ngControl = inject(NgControl, { self: true });
    private _ngSelectComponent = inject(NgSelectComponent, { self: true });
    private _formFieldService = inject(FormFieldService);
    private _destroy$ = inject(DestroyService);
    private _cdr = inject(ChangeDetectorRef);
    private _translate = inject(TranslateService);
    private readonly _config = inject<FormConfig>(FORM_CONFIG, { optional: true });

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
        return this._formFieldService.getElementPlaceholder() ?? '';
    }

    @Input()
    useSearchIconIfSearchable: boolean = this._config?.useSearchIconIfSelectSearchable ?? false;

    ngOnInit() {
        this._viewContainerRef.createComponent(PuiSelectDeepStyleComponent);

        this._formFieldService.registerNgControl(
            this._ngControl,
            this._ngSelectComponent.searchInput?.nativeElement ?? this._elementRef.nativeElement,
        );
        this._formFieldService.setReadonlyValueFunction(() => this.getReadOnlyValue());

        const _subId$ = this._formFieldService.id$.pipe(takeUntil(this._destroy$)).subscribe((id) => {
            this._ngSelectComponent.labelForId = id;
            setAttr('autocomplete', 'off', this.ngSelectInputElement());

            const ariaDescribedByError = `${id}-error`;
            const ariaDescribedByCustom = `${id}-description`;

            const ids = [this.ariaDescribedby, ariaDescribedByError, ariaDescribedByCustom].filter(Boolean).join(' ');
            setAttr('aria-describedby', ids, this.ngSelectInputElement());
        });
        const _subRequired$ = this._formFieldService.isRequired$
            .pipe(takeUntil(this._destroy$))
            .subscribe((isRequired) => setAttr('required', isRequired, this.ngSelectInputElement()));
        const _subLoading$ = this._formFieldService.loading$
            .pipe(takeUntil(this._destroy$))
            .subscribe((loading) => setHostClassNames({ 'pui-loading': loading }, this._elementRef));
        const _subInvalid$ = this._formFieldService.displayAsInvalid$
            .pipe(takeUntil(this._destroy$))
            .subscribe((displayAsInvalid) =>
                setHostClassNames({ 'pui-hide-invalid': !displayAsInvalid }, this._elementRef),
            );

        // Displays the label as placeholder, until focused, then switches to actual placeholder (if defined)
        const _subPlaceholder$ = this._formFieldService.placeholder$
            .pipe(takeUntil(this._destroy$))
            .subscribe((placeholder) => {
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

        const _subReadonlyValue$ = this._formFieldService.readonlyValue$
            .pipe(takeUntil(this._destroy$))
            .subscribe((value) => {
                const input = this.ngSelectInputElement();
                if (!input) return;
                const label = input.labels?.[0]?.innerText;
                input.ariaLabel = label ? `${label} ${value}` : (value ?? '');
            });

        if (this._ngSelectComponent.clearable) {
            const _subValue$ = this._formFieldService.value$.pipe(takeUntil(this._destroy$)).subscribe((value) => {
                this._formFieldService.setClearable(isDefinedAndNotEmptyArray(value));
            });
        }

        const _subClear$ = this._formFieldService.clear$
            .pipe(takeUntil(this._destroy$))
            .subscribe(() => this._ngSelectComponent.handleClearClick());
    }

    ngAfterViewInit() {
        // This need to be done after view init, because the select-view-source directive set searchable at on init
        this._formFieldService.setIcon({
            component:
                this.useSearchIconIfSearchable && this._ngSelectComponent.searchable
                    ? PuiIconSearchComponent
                    : PuiIconArrowComponent,
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
                    (index > 0 ? ', ' : '') + (elem[this._ngSelectComponent.bindLabel ?? 'label'] || '')),
        );
        return selectedValuesString;
    }

    private ngSelectInputElement(): HTMLInputElement | null {
        return this._elementRef.nativeElement.querySelector('input');
    }
}

