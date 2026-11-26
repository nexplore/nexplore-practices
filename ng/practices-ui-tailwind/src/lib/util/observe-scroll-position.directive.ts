import {
    AfterViewInit,
    Directive,
    ElementRef,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output,
    inject,
} from '@angular/core';
import { getScrollParent } from './utils';

export type ScrollPositionChange = { top: number; left: number };

@Directive({
    standalone: true,
    selector: '[puiObserveScrollPosition]',
})
export class ObserveScrollPositionDirective implements OnInit, OnDestroy, AfterViewInit {
    private elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

    /** Observes the position relative to the scroll parent, whenever scrolled */
    @Output()
    puiObserveScrollPosition = new EventEmitter<ScrollPositionChange>();

    @Input()
    puiObserveScrollPositionScrollParent?: Element;

    scrollParent?: Element | Document;

    private checkScrollPosition = (): void => {
        const rect = this.elementRef.nativeElement.getBoundingClientRect();
        const parentRect =
            this.scrollParent instanceof Document ? { top: 0, left: 0 } : this.scrollParent?.getBoundingClientRect();
        if (!parentRect) {
            return;
        }
        this.puiObserveScrollPosition.emit({
            top: rect.top - parentRect.top,
            left: rect.left - parentRect.left,
        });
    };

    ngOnInit(): void {
        this.scrollParent = this.puiObserveScrollPositionScrollParent ?? getScrollParent(this.elementRef.nativeElement);
        this.scrollParent.addEventListener('scroll', this.checkScrollPosition, { passive: true });

        if (this.scrollParent !== document) {
            window.addEventListener('scroll', this.checkScrollPosition);
        }
    }

    ngAfterViewInit(): void {
        this.checkScrollPosition();
    }

    ngOnDestroy(): void {
        this.scrollParent?.removeEventListener('scroll', this.checkScrollPosition);
        window.removeEventListener('scroll', this.checkScrollPosition);
    }
}

