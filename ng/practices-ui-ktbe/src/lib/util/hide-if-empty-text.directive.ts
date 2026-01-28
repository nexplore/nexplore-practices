import { DestroyRef, Directive, ElementRef, EventEmitter, inject, Output } from '@angular/core';

const EMPTY_TEXT_EVENT = 'puibeHideIfEmptyText:empty-change';

/**
 * Hides the element if it has no visible text content.
 *
 * Note: If the element has a display style set, it will be overridden when hiding/showing the element. The original value won't be restored.
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
            this._hideIfEmpty();
        });

        const onChildEmptyChange = (event: Event) => {
            if (!(event instanceof CustomEvent)) {
                return;
            }

            const customEvent = event as CustomEvent<{ empty: boolean }>;
            if (customEvent.detail?.empty === false) {
                this._elementRef.nativeElement.style.removeProperty('display');
                this.emptyTextChange.emit(false);
            } else {
                this._hideIfEmpty();
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
    private _hideIfEmpty(): void {
        if (!this._elementRef.nativeElement.innerText) {
            if (this._elementRef.nativeElement.style.display !== 'none') {
                this._elementRef.nativeElement.style.display = 'none';
                this.emptyTextChange.emit(true);
                this._emitEmptyEvent(true);
            }
        } else {
            if (this._elementRef.nativeElement.style.display === 'none') {
                // TODO: consider restoring previous display value instead of removing the style
                this._elementRef.nativeElement.style.removeProperty('display');
                this.emptyTextChange.emit(false);
                this._emitEmptyEvent(false);
            }
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
