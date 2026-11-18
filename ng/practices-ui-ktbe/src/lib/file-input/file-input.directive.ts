import { Directive, ElementRef, HostListener, Input, OnInit, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { DestroyService } from '@nexplore/practices-ui';
import { TranslateService } from '@ngx-translate/core';
import { takeUntil } from 'rxjs';
import { FormFieldService } from '../form-field/form-field.service';
import { PuibeIconUploadComponent } from '../icons/icon-upload.component';
import { setClassNames } from '../util/utils';

const MARK_TOUCHED_DELAY = 100;

@Directive({
    standalone: true,
    selector: 'input[puibeInput][type="file"]',
    providers: [
        DestroyService,
        {
            provide: NG_VALUE_ACCESSOR,
            multi: true,
            useExisting: forwardRef(() => PuibeFileInputDirective),
        },
    ],
})
export class PuibeFileInputDirective implements OnInit, ControlValueAccessor {
    @HostListener('change')
    emitFiles() {
        const file = this.inputElement.files[0];
        this._onChange(file);
    }

    @HostListener('click')
    onClick() {
        this._fileDialogIsOpen = true;
    }

    @HostListener('keydown', ['$event'])
    onKeydown(ev: KeyboardEvent) {
        if (ev.code === 'Tab' && document.activeElement === this.inputElement) {
            this._formFieldService.markAsTouched();
        }
    }

    @HostListener('focus')
    onFocus() {
        this._formFieldService.updateOverlayText({ isFocused: true });

        // this is a workaround to trigger mark as touched on upload dialoge close.
        if (this._fileDialogIsOpen) {
            // Debaunce display validation while fileinput is changing
            setTimeout(() => this._formFieldService.markAsTouched(), MARK_TOUCHED_DELAY);
            this._fileDialogIsOpen = false;
        }
    }

    @HostListener('blur')
    onBlur() {
        this._formFieldService.updateOverlayText({ isFocused: false });
    }

    @Input()
    placeholder?: string;

    private _fileDialogIsOpen = false;
    private _value: File | string | null = null;
    private _onChange: (file: File) => void;

    private inputElement: HTMLInputElement;

    constructor(
        private _elementRef: ElementRef<HTMLInputElement>,
        private _formFieldService: FormFieldService,
        private _destroy$: DestroyService,
        private _translate: TranslateService
    ) {
        this.inputElement = this._elementRef.nativeElement;
    }

    writeValue(value: File | string | null): void {
        this._value = value;
        this._formFieldService.updateOverlayText({ text: this._toOverlayText(value) });
        if (!value) {
            this.inputElement.value = null;
        }
    }

    registerOnChange(fn: (file: File) => void): void {
        this._onChange = fn;
    }

    registerOnTouched(_: () => void): void {}

    setDisabledState(isDisabled: boolean): void {
        this._elementRef.nativeElement.disabled = isDisabled;
    }

    ngOnInit() {
        // If no placeholder is set, it will use the default placeholder for file inputs
        if (!this.placeholder) {
            this.placeholder = this._translate.instant('Practices.Labels_No_File_Selected');
        }

        this._formFieldService.setIcon({
            component: PuibeIconUploadComponent,
            fill: true,
            clickable: true,
            invert: true,
        });

        // Hide native file input content to hide the default button and label
        setClassNames({ ['opacity-0']: true }, this.inputElement);

        // writeValue may already have run before ngOnInit, so keep its value instead of always showing the placeholder.
        this._formFieldService.setOverlayText({ text: this._toOverlayText(this._value) });

        this._formFieldService.value$.pipe(takeUntil(this._destroy$)).subscribe((value: File | string | null) => {
            this._formFieldService.updateOverlayText({ text: this._toOverlayText(value) });
        });

        this._formFieldService.iconClick$.pipe(takeUntil(this._destroy$)).subscribe(() => {
            this._elementRef.nativeElement.focus();
            this._elementRef.nativeElement.click();
        });
    }

    /**
     * Text shown in the field: a string value as is, a file by its name, and the placeholder when empty.
     * Without the fallback a reset (e.g. `form.reset()`) would leave the field without any visible text.
     */
    private _toOverlayText(value: File | string | null | undefined): string | undefined {
        const text = typeof value === 'string' ? value : value?.name;
        return text || this.placeholder;
    }
}
