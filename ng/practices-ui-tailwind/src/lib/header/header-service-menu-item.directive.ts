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

const className =
    'text-small leading-normal font-sans font-normal inline-block no-underline h-4 my-0 outline-hidden after:block after:content hover:text-black';
const activeClassNames = 'after:border-brand after:scale-x-100';
const inactiveClassNames =
    'after:border-black after:scale-x-0 after:transition-transform after:duration-100 after:ease-in-out hover:after:scale-x-100 focus:after:scale-x-100 active:after:scale-x-100';
const withoutAnimationClassNames = 'after:border-b-0';
const withAnimationClassNames = 'after:border-b-2';

@Directive({
    standalone: true,
    selector: '[puiHeaderServiceMenuItem]',
    providers: [DestroyService, MenuItemService],
})
export class PuiHeaderServiceMenuItemDirective implements OnInit, OnDestroy {
    private _destroy$ = inject(DestroyService);
    private _menuItemService = inject(MenuItemService);
    private _elementRef = inject(ElementRef);
    private _renderer = inject(Renderer2);
    private _translate = inject(TranslateService);

    @HostBinding('class')
    className = className;

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

    private screenReaderTextElement: HTMLSpanElement | null = null;
    private _activeSub: import('rxjs').Subscription | null = null;

    ngOnInit(): void {
        wrapHostWithListItemElement(this._elementRef, this._renderer, 'inline-block');
        this.screenReaderTextElement = createScreenReaderTextElement(this._elementRef, this._renderer);

        this._activeSub = this._menuItemService.routerLinkActive$
            .pipe(takeUntil(this._destroy$))
            .subscribe((isActive) => {
                if (this.screenReaderTextElement) {
                    setScreenReaderText(isActive, this.screenReaderTextElement, this._translate);
                }
                this.setClassNames(isActive);
            });
    }

    ngOnDestroy(): void {
        removeParentElementFromDom(this._elementRef, this._renderer);
        this._activeSub?.unsubscribe();
    }

    private setClassNames(isActive: boolean) {
        setHostClassNames(
            {
                [withAnimationClassNames]: this.withAnimation,
                [withoutAnimationClassNames]: !this.withAnimation,
                [inactiveClassNames]: this.withAnimation && !isActive,
                [activeClassNames]: this.withAnimation && isActive,
            },
            this._elementRef,
        );
    }
}

