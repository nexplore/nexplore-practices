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

    constructor(private _renderer: Renderer2, private _elementRef: ElementRef) {}

    ngOnInit(): void {
        wrapHostWithListItemElement(this._elementRef, this._renderer, 'inline-block', 'mr-6', 'last-of-type:mr-0');
    }

    ngOnDestroy(): void {
        removeParentElementFromDom(this._elementRef, this._renderer);
    }
}
