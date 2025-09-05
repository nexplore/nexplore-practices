import { Directive, ElementRef, EventEmitter, inject, Input, OnDestroy, OnInit, Output } from '@angular/core';

export type ScreenPositionChange = { left: number; top: number; height: number; width: number };

@Directive({
    standalone: true,
    selector: '[puibeObserveScreenPosition]',
})
export class ObserveScreenPositionDirective implements OnInit, OnDestroy {
    private elementRef = inject(ElementRef<HTMLElement>);
    private isActive = true;
    private prevVal: ScreenPositionChange;

    /** Observes the position on the screen. Checks continously every frame */
    @Output()
    puibeObserveScreenPosition = new EventEmitter<ScreenPositionChange>();

    @Input()
    set puibeObserveScreenPositionEnabled(val: boolean) {
        if (val && !this.isActive) {
            this.isActive = true;
            requestAnimationFrame(this.observe);
            this.prevVal = null;
        } else {
            this.isActive = val;
            this.prevVal = null;
        }
    }

    private observe = (): void => {
        const rect = this.elementRef.nativeElement.getBoundingClientRect();
        const change = {
            left: Math.min(rect.left, window.outerWidth),
            top: Math.min(rect.top, window.outerHeight),
            width: rect.width,
            height: rect.height,
        };

        const isSame =
            this.prevVal &&
            this.prevVal.top === change.top &&
            this.prevVal.left === change.left &&
            this.prevVal.width === change.width &&
            this.prevVal.height === change.height;

        if (!isSame) {
            this.puibeObserveScreenPosition.emit(change);
        }

        this.prevVal = change;
        if (this.isActive) {
            requestAnimationFrame(this.observe);
        }
    };

    ngOnInit(): void {
        requestAnimationFrame(this.observe);
    }

    ngOnDestroy(): void {
        this.isActive = false;
    }
}
