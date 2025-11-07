import { Directive, ElementRef, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, inject } from '@angular/core';
import { getScrollParent, setClassNames } from './utils';

@Directive({
    standalone: true,
    selector: '[puibeSticky], [puibeStickyClass]',
})
export class PuibeStickyDirective implements OnInit, OnDestroy, OnChanges {
    private elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

    private resizeObserver: ResizeObserver;

    private scrollParent: Element | Document;

    @Input()
    puibeSticky: boolean;

    @Input()
    puibeStickyClass: string;

    @Input()
    puibeStickyThresholdPx = 0;

    @Input()
    puibeStickyDir: 'top' | 'left' | 'right' | 'bottom' = 'top';

    @Input()
    puibeStickyOffClass: string;

    toggleClass: () => any = () => {
        const el = this.elementRef.nativeElement;
        const rect = el.getBoundingClientRect();

        const parentRect =
            this.scrollParent === document
                ? { [this.puibeStickyDir]: 0 }
                : (this.scrollParent as Element).getBoundingClientRect();

        const isSticky =
            rect.height > 0 &&
            rect[this.puibeStickyDir] - parentRect[this.puibeStickyDir] <= this.puibeStickyThresholdPx;
        setClassNames(
            { [this.puibeStickyClass]: isSticky, [this.puibeStickyOffClass]: !isSticky },
            this.elementRef.nativeElement
        );
    };

    ngOnChanges(_changes: SimpleChanges): void {
        if (this.resizeObserver) {
            this.updateSticky();
        }
    }

    ngOnInit(): void {
        this.resizeObserver = new ResizeObserver((_ch) => {
            this.toggleClass();
        });

        this.updateSticky();
    }

    ngOnDestroy(): void {
        this.resizeObserver?.disconnect();
    }

    private updateSticky() {
        if (this.puibeSticky || (this.puibeStickyClass && this.puibeSticky === undefined)) {
            this.elementRef.nativeElement.style.position = 'sticky';
            this.elementRef.nativeElement.style[this.puibeStickyDir] = `${this.puibeStickyThresholdPx}px`;

            this.resizeObserver.observe(this.elementRef.nativeElement);

            this.scrollParent = getScrollParent(this.elementRef.nativeElement);

            this.scrollParent.addEventListener('scroll', this.toggleClass);
        } else {
            this.elementRef.nativeElement.style.removeProperty('position');
            if (this.puibeStickyDir) {
                this.elementRef.nativeElement.style.removeProperty(this.puibeStickyDir);
            }

            this.resizeObserver.disconnect();

            this.scrollParent?.removeEventListener('scroll', this.toggleClass);
        }
    }
}
