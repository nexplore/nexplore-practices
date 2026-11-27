import { Directive, ElementRef, HostBinding, Input, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { DestroyService } from '@nexplore/practices-ui';
import { TranslateService } from '@ngx-translate/core';
import { takeUntil } from 'rxjs';

import { MenuItemRouterLink, MenuItemRouterLinkActiveOptions, MenuItemService } from '../menu-item.service';
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
    @HostBinding('class')
    className: string = classNames;

    /** Link of the item. With Angular's `RouterLink` on the same element, its URL is used for the active state. */
    @Input()
    set routerLink(value: MenuItemRouterLink) {
        this._menuItemService.setRouterLink(value);
    }

    /** Marks the item as active for this URL, without Angular's `RouterLink`. Takes precedence over `routerLink`. */
    @Input()
    set navLink(value: MenuItemRouterLink) {
        this._menuItemService.setNavLink(value);
    }

    @Input()
    set routerLinkActiveOptions(value: MenuItemRouterLinkActiveOptions) {
        this._menuItemService.setRouterLinkActiveOptions(value);
    }

    /** Options for `navLink`. Takes precedence over `routerLinkActiveOptions`. */
    @Input()
    set navLinkActiveOptions(value: MenuItemRouterLinkActiveOptions) {
        this._menuItemService.setNavLinkActiveOptions(value);
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

    constructor(
        private _destroy$: DestroyService,
        private _menuItemService: MenuItemService,
        private _elementRef: ElementRef,
        private _renderer: Renderer2,
        private _translate: TranslateService
    ) {}

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
