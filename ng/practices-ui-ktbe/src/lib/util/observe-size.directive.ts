import { Directive, ElementRef, EventEmitter, OnDestroy, OnInit, Output, inject } from '@angular/core';

export type SizeChange = DOMRect

@Directive({
    standalone: true,
    selector: '[puibeObserveSize]',
})
export class PuibeObserveSizeDirective implements OnInit, OnDestroy {
    private elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

    private obs: ResizeObserver;

    @Output()
    puibeObserveSize = new EventEmitter<SizeChange>();

    ngOnInit(): void {
        this.obs = new ResizeObserver((ch) => {
            this.puibeObserveSize.emit(ch[0].contentRect);
        });
        this.obs.observe(this.elementRef.nativeElement);

        this.puibeObserveSize.emit(this.elementRef.nativeElement.getBoundingClientRect());
    }

    ngOnDestroy(): void {
        this.obs.disconnect();
    }
}
