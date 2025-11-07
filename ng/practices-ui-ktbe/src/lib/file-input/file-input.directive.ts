import { Directive, ElementRef, HostListener, Input, OnInit, forwardRef, inject } from '@angular/core';
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
    private _elementRef = inject<ElementRef<HTMLInputElement>>(ElementRef);
    private _formFieldService = inject(FormFieldService);
    private _destroy$ = inject(DestroyService);
    private _translate = inject(TranslateService);

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
    private _onChange: (file: File) => void;

    private inputElement: HTMLInputElement;

    constructor() {
        this.inputElement = this._elementRef.nativeElement;
    }

    writeValue(value: File | string): void {
        this._formFieldService.updateOverlayText({ text: typeof value === 'string' ? value : value?.name });
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

        this._formFieldService.setOverlayText({ text: this.placeholder });

        this._formFieldService.value$.pipe(takeUntil(this._destroy$)).subscribe((value: File) => {
            this._formFieldService.updateOverlayText({ text: value?.name ?? this.placeholder });
        });

        this._formFieldService.iconClick$.pipe(takeUntil(this._destroy$)).subscribe(() => {
            this._elementRef.nativeElement.focus();
            this._elementRef.nativeElement.click();
        });
    }
}
