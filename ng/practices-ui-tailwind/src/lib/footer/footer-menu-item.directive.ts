import { Directive, ElementRef, HostBinding, Input, OnDestroy, OnInit, Renderer2, inject } from '@angular/core';
import { IsActiveMatchOptions } from '@angular/router';
import { DestroyService } from '@nexplore/practices-ui';
import { TranslateService } from '@ngx-translate/core';
import { takeUntil } from 'rxjs';

import { MenuItemService } from '../menu-item.service';
import {
    createScreenReaderTextElement,
    removeParentElementFromDom,
    setScreenReaderText,
} from '../util/menu-item-utils';
import { setHostClassNames } from '../util/utils';

const className =
    'font-sans font-normal text-small leading-normal no-underline inline-block h-5 outline-hidden mr-9 last-of-type:mr-0 last:mb-0';
const linkClassNames =
    'after:block after:border-b-2 w-fit after:scale-x-0 after:transition-transform after:duration-100 after:ease-in-out hover:after:scale-x-100 focus:after:scale-x-100 active:after:scale-x-100 hover:text-black';
const activeClassNames = 'after:border-brand after:scale-x-100';
const inactiveClassNames =
    'after:border-black after:scale-x-0 after:transition-transform after:duration-100 after:ease-in-out hover:after:scale-x-100 focus:after:scale-x-100 active:after:scale-x-100';
const withoutAnimationClassNames = 'after:border-b-0';

@Directive({
    standalone: true,
    selector: '[puiFooterMenuItem]',
    providers: [DestroyService, MenuItemService],
})
export class PuiFooterMenuItemDirective implements OnInit, OnDestroy {
    private _destroy$ = inject(DestroyService);
    private _menuItemService = inject(MenuItemService);
    private _elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private _renderer = inject(Renderer2);
    private _translate = inject(TranslateService);

    @HostBinding('class')
    readonly className = className;

    @HostBinding('role')
    readonly role = 'listitem';

    // eslint-disable-next-line @angular-eslint/no-input-rename
    @Input('navLink')
    @Input()
    set routerLink(value: string) {
        this._menuItemService.setRouterLink(value);
    }

    // eslint-disable-next-line @angular-eslint/no-input-rename
    @Input('navLinkActiveOptions')
    @Input()
    set routerLinkActiveOptions(value: IsActiveMatchOptions) {
        this._menuItemService.setRouterLinkActiveOptions(value);
    }

    @Input()
    set isActive(value: boolean) {
        this._menuItemService.setIsActive(value);
    }

    @Input()
    withAnimation = true;

    private screenReaderTextElement: HTMLSpanElement;

    ngOnInit(): void {
        this.screenReaderTextElement = createScreenReaderTextElement(this._elementRef, this._renderer);

        this._menuItemService.routerLinkActive$.pipe(takeUntil(this._destroy$)).subscribe((isActive) => {
            setScreenReaderText(isActive, this.screenReaderTextElement, this._translate);
            this.setClassNames(isActive);
        });

        setHostClassNames(
            {
                [linkClassNames]: this._isLink(),
            },
            this._elementRef,
        );
    }

    ngOnDestroy(): void {
        removeParentElementFromDom(this._elementRef, this._renderer);
    }

    private _isLink(): boolean {
        return !!this.routerLink || this._elementRef.nativeElement.matches('a');
    }

    private setClassNames(isActive: boolean) {
        setHostClassNames(
            {
                [withoutAnimationClassNames]: !this.withAnimation,
                [inactiveClassNames]: this._isLink() && this.withAnimation && !isActive,
                [activeClassNames]: this.withAnimation && isActive,
            },
            this._elementRef,
        );
    }
}

