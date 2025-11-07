import {
    AfterViewInit,
    Directive,
    ElementRef,
    EventEmitter,
    HostBinding,
    HostListener,
    Input,
    OnInit,
    Output,
    Renderer2,
    inject,
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { applyLanguageAriaAttributes } from '../util/aria.utils';
import { PuiLocale } from '../util/constants';
import { setHostAttr, setHostClassNames } from '../util/utils';

const className =
    'font-normal text-small uppercase inline-block h-5 leading-tight mx-1.5 no-underline outline-hidden last-of-type:mr-0 first-of-type:ml-0';
const activeClassNames = 'border-b-2 border-brand';
const inactiveClassNames =
    'border-b-0 after:block after:border-b-2 after:scale-x-0 after:transition-transform after:duration-100 after:ease-in-out hover:after:scale-x-100 focus:after:scale-x-100 active:after:scale-x-100';

@Directive({
    standalone: true,
    selector: 'button[puiHeaderLanguageMenuItem]',
})
export class PuiHeaderLanguageMenuItemDirective implements OnInit, AfterViewInit {
    private _elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private _renderer = inject(Renderer2);
    private _translateService = inject(TranslateService);

    @HostListener('click')
    onClick() {
        if (!this.isActive) {
            this.languageChanged.emit(this.language);
        }

        this.updateStylesAndAriaAttributes();
    }

    @HostBinding('class')
    className: string = className;

    private _isActive = false;
    @Input()
    set isActive(value: boolean) {
        this._isActive = value;
        this._elementRef.nativeElement.tabIndex = value ? -1 : 0;
        this.updateStylesAndAriaAttributes();
    }
    get isActive(): boolean {
        return this._isActive;
    }

    @Output()
    languageChanged: EventEmitter<string> = new EventEmitter();

    private _language: PuiLocale = 'en' as PuiLocale;

    @Input()
    set language(value: PuiLocale) {
        this._elementRef.nativeElement.innerText = value;
        this._language = value;
    }

    get language(): PuiLocale {
        return this._language;
    }

    ngOnInit(): void {
        this.renderSeparator();

        setHostAttr(
            'aria-description',
            this._translateService.instant('Practices.Labels_Navigation_ChooseOtherLanguage'),
            this._elementRef,
        );
    }

    ngAfterViewInit(): void {
        if (!this.language) {
            this._language = this._elementRef.nativeElement.innerText?.trim() as PuiLocale;
        }

        this.updateStylesAndAriaAttributes();
    }

    private updateStylesAndAriaAttributes(): void {
        setHostClassNames(
            {
                [activeClassNames]: this.isActive,
                [inactiveClassNames]: !this.isActive,
            },
            this._elementRef,
        );

        applyLanguageAriaAttributes(this._elementRef, this.language);
    }

    private renderSeparator(): void {
        if (this._elementRef.nativeElement.nextElementSibling) {
            const span: HTMLSpanElement = this._renderer.createElement('span');
            span.innerText = '|';

            this._renderer.insertBefore(
                this._elementRef.nativeElement.parentElement,
                span,
                this._elementRef.nativeElement.nextElementSibling,
            );
        }
    }
}

