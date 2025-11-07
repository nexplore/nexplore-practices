import { DestroyRef, Directive, ElementRef, EventEmitter, inject, Output } from '@angular/core';

/**
 * Hides the element if it has no visible text content.
 */
@Directive({
    selector: '[puiHideIfEmptyText]',
    standalone: true,
})
export class PuiHideIfEmptyTextDirective {
    private readonly _elementRef = inject(ElementRef<HTMLElement>);
    private readonly _parent = inject(PuiHideIfEmptyTextDirective, { optional: true, skipSelf: true });

    @Output()
    emptyTextChange = new EventEmitter<boolean>();

    constructor() {
        const destroyRef = inject(DestroyRef);

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

    /**
     * Hides the element if it has no visible text content.
     */
    public hideIfEmpty(): void {
        if (!this._elementRef.nativeElement.innerText) {
            if (this._elementRef.nativeElement.style.display !== 'none') {
                this._elementRef.nativeElement.style.display = 'none';
                this.emptyTextChange.emit(true);
                this._parent?.hideIfEmpty(); // propagate to parent directive
            }
        } else {
            if (this._elementRef.nativeElement.style.display === 'none') {
                this._elementRef.nativeElement.style.removeProperty('display');
                this.emptyTextChange.emit(false);
                this._parent?.overrideEmpty(false); // Force parent to show if it was hidden
            }
        }
    }

    /**
     * @internal
     *
     * Overrides the empty state manually.
     *
     * If `true`, the element will be hidden regardless of its content, otherwise it will be shown.
     */
    public overrideEmpty(empty: boolean): void {
        if (empty) {
            this._elementRef.nativeElement.style.display = 'none';
            this.emptyTextChange.emit(true);
        } else {
            this._elementRef.nativeElement.style.removeProperty('display');
            this.emptyTextChange.emit(false);
        }
    }
}

