import { Directive, ElementRef, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, inject } from '@angular/core';
import { getScrollParent, setClassNames } from './utils';

@Directive({
    standalone: true,
    selector: '[puiSticky], [puiStickyClass]',
})
export class PuiStickyDirective implements OnInit, OnDestroy, OnChanges {
    private elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

    private resizeObserver: ResizeObserver | null = null;

    private scrollParent: Element | Document | null = null;

    @Input()
    puiSticky: boolean | undefined = undefined;

    @Input()
    puiStickyClass = '';

    @Input()
    puiStickyThresholdPx = 0;

    @Input()
    puiStickyDir: 'top' | 'left' | 'right' | 'bottom' = 'top';

    @Input()
    puiStickyOffClass = '';

    toggleClass: () => void = () => {
        const el = this.elementRef.nativeElement;
        const rect = el.getBoundingClientRect();

        const parentRect =
            this.scrollParent === document
                ? { [this.puiStickyDir]: 0 }
                : ((this.scrollParent as Element | null)?.getBoundingClientRect?.() ?? { [this.puiStickyDir]: 0 });

        const isSticky =
            rect.height > 0 && rect[this.puiStickyDir] - parentRect[this.puiStickyDir] <= this.puiStickyThresholdPx;
        setClassNames(
            { [this.puiStickyClass]: isSticky, [this.puiStickyOffClass]: !isSticky },
            this.elementRef.nativeElement,
        );
    };

    ngOnChanges(_changes: SimpleChanges): void {
        if (this.resizeObserver) {
            this.updateSticky();
        }
    }

    ngOnInit(): void {
        this.resizeObserver = new ResizeObserver(() => this.toggleClass());

        this.updateSticky();
    }

    ngOnDestroy(): void {
        this.resizeObserver?.disconnect();
        this.scrollParent?.removeEventListener('scroll', this.toggleClass);
    }

    private updateSticky() {
        if (this.puiSticky || (this.puiStickyClass && this.puiSticky === undefined)) {
            this.elementRef.nativeElement.style.position = 'sticky';
            this.elementRef.nativeElement.style[this.puiStickyDir] = `${this.puiStickyThresholdPx}px`;

            this.resizeObserver?.observe(this.elementRef.nativeElement);

            this.scrollParent = getScrollParent(this.elementRef.nativeElement);

            this.scrollParent?.addEventListener('scroll', this.toggleClass);
        } else {
            this.elementRef.nativeElement.style.removeProperty('position');
            if (this.puiStickyDir) {
                this.elementRef.nativeElement.style.removeProperty(this.puiStickyDir);
            }

            this.resizeObserver?.disconnect();

            this.scrollParent?.removeEventListener('scroll', this.toggleClass);
        }
    }
}

