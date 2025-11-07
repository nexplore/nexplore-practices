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
    wrapHostWithListItemElement,
} from '../util/menu-item-utils';
import { setHostClassNames } from '../util/utils';

const classNames =
    'cursor-pointer inline-block leading-normal no-underline outline-none hover:text-black after:block after:border-b-2';
const smallClassNames = 'font-normal text-base h-6';
const bigClassNames = 'font-light text-h4 mb-1 h-9';
const inactiveClassNames =
    'after:scale-x-0 after:transition-all after:duration-150 after:ease-in-out hover:after:scale-x-100 focus:after:scale-x-100 active:after:scale-x-100';
const activeClassNames = 'after:scale-x-100 after:border-red';
const iconClassNames = 'hover:animate-pop focus:animate-pop';
const bigIconClassNames = 'w-8 h-8';
const smallIconClassNames = 'w-6 h-6';
const withoutAnimationClassNames = 'after:border-b-0';

@Directive({
    standalone: true,
    selector: 'a[puibeHeaderMainMenuItem], button[puibeHeaderMainMenuItem]',
    providers: [DestroyService, MenuItemService],
})
export class PuibeHeaderMainMenuItemDirective implements OnInit, OnDestroy {
    private _destroy$ = inject(DestroyService);
    private _menuItemService = inject(MenuItemService);
    private _elementRef = inject(ElementRef);
    private _renderer = inject(Renderer2);
    private _translate = inject(TranslateService);

    @HostBinding('class')
    className: string = classNames;

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

    @Input()
    isSmall = false;

    @Input()
    isIcon = false;

    private screenReaderTextElement: HTMLSpanElement;

    ngOnInit(): void {
        const liClassNames = ['inline-block'].concat(this.isIcon ? (this.isSmall ? ['h-6'] : ['h-8']) : []);
        wrapHostWithListItemElement(this._elementRef, this._renderer, ...liClassNames);
        this.screenReaderTextElement = createScreenReaderTextElement(this._elementRef, this._renderer);

        this._menuItemService.routerLinkActive$.pipe(takeUntil(this._destroy$)).subscribe((isActive) => {
            setScreenReaderText(isActive, this.screenReaderTextElement, this._translate);
            this.setClassNames(isActive);
        });
    }

    ngOnDestroy(): void {
        removeParentElementFromDom(this._elementRef, this._renderer);
    }

    private setClassNames(isActive: boolean) {
        setHostClassNames(
            {
                [smallClassNames]: !this.isIcon && this.isSmall,
                [bigClassNames]: !this.isIcon && !this.isSmall,
                [activeClassNames]: isActive,
                [inactiveClassNames]: !isActive,
                [iconClassNames]: this.isIcon,
                [smallIconClassNames]: this.isIcon && this.isSmall,
                [bigIconClassNames]: this.isIcon && !this.isSmall,
                [withoutAnimationClassNames]: !this.withAnimation,
            },
            this._elementRef
        );
    }
}
