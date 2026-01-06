import { DestroyRef, Directive, ElementRef, EventEmitter, inject, Output } from '@angular/core';

const EMPTY_TEXT_EVENT = 'puibeHideIfEmptyText:empty-change';

/**
 * Hides the element if it has no visible text content.
 */
@Directive({
    selector: '[puibeHideIfEmptyText]',
    standalone: true,
})
export class PuibeHideIfEmptyTextDirective {
    private readonly _elementRef = inject(ElementRef<HTMLElement>);

    @Output()
    emptyTextChange = new EventEmitter<boolean>();

    constructor(destroyRef: DestroyRef) {
        const element = this._elementRef.nativeElement;
        const mutationObserver = new MutationObserver(() => {
            this.hideIfEmpty();
        });

        const onChildEmptyChange = (event: CustomEvent<{ empty?: boolean }>) => {
            if (event.target === element) {
                return;
            }

            if (event.detail?.empty === false) {
                this._overrideEmpty(false);
            } else {
                this.hideIfEmpty();
            }
        };

        mutationObserver.observe(element, {
            childList: true,
            subtree: true,
            characterData: true,
        });

        destroyRef.onDestroy(() => {
            mutationObserver.disconnect();
            element.removeEventListener(EMPTY_TEXT_EVENT, onChildEmptyChange);
        });

        element.addEventListener(EMPTY_TEXT_EVENT, onChildEmptyChange);
    }

    /**
     * Hides the element if it has no visible text content.
     */
    public hideIfEmpty(): void {
        if (!this._elementRef.nativeElement.innerText) {
            if (this._elementRef.nativeElement.style.display !== 'none') {
                this._elementRef.nativeElement.style.display = 'none';
                this.emptyTextChange.emit(true);
                this._emitEmptyEvent(true);
            }
        } else {
            if (this._elementRef.nativeElement.style.display === 'none') {
                this._elementRef.nativeElement.style.removeProperty('display');
                this.emptyTextChange.emit(false);
                this._emitEmptyEvent(false);
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
    private _overrideEmpty(empty: boolean): void {
        if (empty) {
            this._elementRef.nativeElement.style.display = 'none';
            this.emptyTextChange.emit(true);
        } else {
            this._elementRef.nativeElement.style.removeProperty('display');
            this.emptyTextChange.emit(false);
        }
    }

    private _emitEmptyEvent(empty: boolean): void {
        this._elementRef.nativeElement.dispatchEvent(
            new CustomEvent(EMPTY_TEXT_EVENT, {
                detail: { empty },
                bubbles: true,
            })
        );
    }
}

