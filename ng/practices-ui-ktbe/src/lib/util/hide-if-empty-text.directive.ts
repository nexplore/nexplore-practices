import { DestroyRef, Directive, ElementRef, EventEmitter, inject, Output } from '@angular/core';

/**
 * Hides the element if it has no visible text content.
 */
@Directive({
    selector: '[puibeHideIfEmptyText]',
    standalone: true,
})
export class PuibeHideIfEmptyTextDirective {
    private readonly _elementRef = inject(ElementRef<HTMLElement>);
    private readonly _parent = inject(PuibeHideIfEmptyTextDirective, { optional: true, skipSelf: true });

    @Output()
    emptyTextChange = new EventEmitter<boolean>();

    constructor(destroyRef: DestroyRef) {
        const mutationObserver = new MutationObserver(() => {
            this.hideIfEmpty();
        });

        mutationObserver.observe(this._elementRef.nativeElement, {
            childList: true,
            subtree: true,
            characterData: true,
        });

        destroyRef.onDestroy(() => mutationObserver.disconnect());
    }

    hideIfEmpty(): void {
        if (!this._elementRef.nativeElement.innerText) {
            if (this._elementRef.nativeElement.style.display !== 'none') {
                this._elementRef.nativeElement.style.display = 'none';
                this.emptyTextChange.emit(true);
            }
        } else {
            if (this._elementRef.nativeElement.style.display === 'none') {
                this._elementRef.nativeElement.style.removeProperty('display');
                this.emptyTextChange.emit(false);
            }
        }

        this._parent?.hideIfEmpty();
    }
}
