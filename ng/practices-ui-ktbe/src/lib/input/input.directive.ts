import { Directive, ElementRef, HostBinding, HostListener, Input, OnInit, inject } from '@angular/core';
import { NgControl } from '@angular/forms';
import { DestroyService } from '@nexplore/practices-ui';
import { takeUntil } from 'rxjs';
import { FormFieldService } from '../form-field/form-field.service';
import { setHostAttr, setHostClassNames } from '../util/utils';

const className =
    'bg-white disabled:bg-light-gray w-full border scrollbar-thin border-l-ktbe-6 border-solid pl-6 pr-ktbe-15 text-black placeholder:text-dark-gray placeholder-shown:text-dark-gray';
const inputClassNames = 'h-ktbe-15';
const textAreaClassNames = 'py-ktbe-4.5 min-h-20';

const validClassNames =
    'border-black placeholder-shown:border-dark-gray placeholder-shown:border-l placeholder-shown:pl-ktbe-7.5';
const invalidClassNames = 'border-red placeholder-shown:border-l-ktbe-6 placeholder-shown:pl-6';

@Directive({
    standalone: true,
    selector: 'input[puibeInput], textarea[puibeInput], [puibeInputGeneric]',
    providers: [DestroyService],
})
export class PuibeInputDirective implements OnInit {
    private _elementRef = inject<ElementRef<HTMLInputElement | HTMLTextAreaElement>>(ElementRef);
    private _ngControl = inject(NgControl, { self: true });
    private _formFieldService = inject(FormFieldService);
    private _destroy$ = inject(DestroyService);

    @HostListener('blur')
    onBlur() {
        if (this._elementRef.nativeElement.type !== 'file') {
            this._formFieldService.markAsTouched();
        }
    }

    @Input('aria-describedby')
    ariaDescribedby: string;

    @Input()
    valueFormatter: (value: string) => string;

    @Input()
    set id(value: string) {
        this._formFieldService.setId(value);
    }

    @Input()
    set placeholder(value: string) {
        this._formFieldService.setElementPlaceholder(value);
    }

    get placeholder(): string {
        return this._formFieldService.getElementPlaceholder();
    }

    @HostBinding('class')
    className = className;

    ngOnInit() {
        this._formFieldService.registerNgControl(this._ngControl, this._elementRef.nativeElement);

        setHostClassNames(
            {
                [inputClassNames]: this._elementRef.nativeElement instanceof HTMLInputElement,
                [textAreaClassNames]: this._elementRef.nativeElement instanceof HTMLTextAreaElement,
            },
            this._elementRef
        );

        this._formFieldService.id$.pipe(takeUntil(this._destroy$)).subscribe((id) => {
            setHostAttr('id', id, this._elementRef);

            const ariaDescribedByError = `${id}-error`;
            const ariaDescribedByCustom = `${id}-description`;

            const ids = [this.ariaDescribedby, ariaDescribedByError, ariaDescribedByCustom].filter(Boolean).join(' ');
            setHostAttr('aria-describedby', ids, this._elementRef);
        });
        this._formFieldService.isRequired$.pipe(takeUntil(this._destroy$)).subscribe((isRequired) => {
            setHostAttr('required', isRequired, this._elementRef);
        });
        this._formFieldService.displayAsInvalid$.pipe(takeUntil(this._destroy$)).subscribe((displayAsInvalid) => {
            setHostClassNames(
                { [invalidClassNames]: displayAsInvalid, [validClassNames]: !displayAsInvalid },
                this._elementRef
            );
        });

        if (this.valueFormatter) {
            this._formFieldService.value$.pipe(takeUntil(this._destroy$)).subscribe((value: string) => {
                if (value) {
                    const formattedValue = this.valueFormatter(value);
                    if (value !== formattedValue) {
                        const cursorPos = this._elementRef.nativeElement.selectionStart;

                        /*  calculate new cursorPos.
                        
                            WARNING: This Solution has its limitations(e.q. if the
                            formatter padds the string to 10 digits this will also happens to the substring before the cursor,
                            therefore the cursor would always jump to the end of the string.) */

                        const substringBeforeCursor = value.substring(0, cursorPos);
                        const newCursorPos =
                            cursorPos +
                            this.valueFormatter(substringBeforeCursor).length -
                            substringBeforeCursor.length;

                        // set formattedValue
                        this._ngControl.control.setValue(formattedValue);

                        this._elementRef.nativeElement.selectionStart = this._elementRef.nativeElement.selectionEnd =
                            newCursorPos;
                    }
                }
            });
        }

        // Displays the label as placeholder, until focused, then switches to actual placeholder (if defined)
        this._formFieldService.placeholder$.pipe(takeUntil(this._destroy$)).subscribe((placeholder) => {
            setHostAttr('placeholder', placeholder, this._elementRef);
        });
    }
}
