import { Directive, ElementRef, HostBinding, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { removeParentElementFromDom, wrapHostWithListItemElement } from '../util/menu-item-utils';

const className = 'cursor-pointer w-8 h-8 hover:animate-pop focus:animate-pop hover:text-black';

@Directive({
    standalone: true,
    selector: 'a[puibeHeaderMobileMenuItem], button[puibeHeaderMobileMenuItem]',
})
export class PuibeHeaderMobileMenuItemDirective implements OnInit, OnDestroy {
    @HostBinding('class')
    className: string = className;

    constructor(
        private _renderer: Renderer2,
        private _elementRef: ElementRef
    ) {}

    ngOnInit(): void {
        // The spacing between the items comes from `gap-x-6` on the surrounding list.
        wrapHostWithListItemElement(this._elementRef, this._renderer, 'inline-block');
    }

    ngOnDestroy(): void {
        removeParentElementFromDom(this._elementRef, this._renderer);
    }
}
