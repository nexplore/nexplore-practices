import { Directive, DoCheck, ElementRef, HostBinding, Input, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { DestroyService } from '@nexplore/practices-ui';
import { TranslateService } from '@ngx-translate/core';
import { takeUntil } from 'rxjs';

import { MenuItemRouterLink, MenuItemRouterLinkActiveOptions, MenuItemService } from '../menu-item.service';
import {
    createScreenReaderTextElement,
    removeParentElementFromDom,
    setScreenReaderText,
} from '../util/menu-item-utils';
import { setHostClassNames } from '../util/utils';

const className =
    'font-sans font-normal text-small leading-normal no-underline inline-block h-5 outline-none mr-9 last-of-type:mr-0 last:mb-0';
const linkClassNames = 'w-fit hover:text-black';
const linkAnimationClassNames =
    'after:block after:border-b-2 after:scale-x-0 after:transition-transform after:duration-100 after:ease-in-out hover:after:scale-x-100 focus:after:scale-x-100 active:after:scale-x-100';
const activeClassNames = 'after:border-red after:scale-x-100';
const inactiveClassNames =
    'after:border-black after:scale-x-0 after:transition-transform after:duration-100 after:ease-in-out hover:after:scale-x-100 focus:after:scale-x-100 active:after:scale-x-100';
const withoutAnimationClassNames = 'after:border-b-0';

@Directive({
    standalone: true,
    selector: '[puibeFooterMenuItem]',
    providers: [DestroyService, MenuItemService],
})
export class PuibeFooterMenuItemDirective implements OnInit, DoCheck, OnDestroy {
    @HostBinding('class')
    readonly className = className;

    @HostBinding('attr.role')
    readonly role = 'listitem';

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

    private screenReaderTextElement: HTMLSpanElement;

    constructor(
        private _destroy$: DestroyService,
        private _menuItemService: MenuItemService,
        private _elementRef: ElementRef<HTMLElement>,
        private _renderer: Renderer2,
        private _translate: TranslateService
    ) {}

    ngOnInit(): void {
        this.screenReaderTextElement = createScreenReaderTextElement(this._elementRef, this._renderer);

        this._menuItemService.routerLinkActive$.pipe(takeUntil(this._destroy$)).subscribe((isActive) => {
            setScreenReaderText(isActive, this.screenReaderTextElement, this._translate);
            this.setClassNames(isActive);
        });
    }

    ngDoCheck(): void {
        this._menuItemService.checkAngularRouterLink();
    }

    ngOnDestroy(): void {
        removeParentElementFromDom(this._elementRef, this._renderer);
    }

    private _isLink(): boolean {
        return this._menuItemService.hasLink || this._elementRef.nativeElement.matches('a');
    }

    private setClassNames(isActive: boolean) {
        setHostClassNames(
            {
                [linkClassNames]: this._isLink(),
                // before the state classes, so these win for the classes they share with the link animation
                [linkAnimationClassNames]: this._isLink() && this.withAnimation,
                [withoutAnimationClassNames]: !this.withAnimation,
                [inactiveClassNames]: this._isLink() && this.withAnimation && !isActive,
                [activeClassNames]: this.withAnimation && isActive,
            },
            this._elementRef
        );
    }
}
