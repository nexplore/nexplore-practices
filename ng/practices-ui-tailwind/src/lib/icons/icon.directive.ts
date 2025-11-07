import { AfterViewInit, Directive, ElementRef, HostBinding, Input, OnChanges, SimpleChanges, inject } from '@angular/core';
import { setHostClassNames } from '../util/utils';
import { puiIconDefaults } from './defaults';
import { IconDirection, IconSize } from './icon.interface';
import { applyIconDirection } from './util';

/**
 * Common base directive for all icons
 */
@Directive({
    standalone: true,
})
export class PuiIconDirectiveBase implements OnChanges, AfterViewInit {
    protected _elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

    protected baseDirection = IconDirection.DOWN;

    @HostBinding('class')
    className = puiIconDefaults.className;

    /**
     * Rotates the icon into the specified direction
     */
    @Input()
    direction: IconDirection;

    /**
     * Allows to customize the size of the icon. By default, no size is applied.
     */
    @Input()
    size: IconSize = IconSize.NONE;

    ngOnChanges(_changes: SimpleChanges): void {
        this.applyChanges();

        setHostClassNames(this.getSizeClasses(), this.getHostElement());
    }

    protected getSizeClasses(): { [key: string]: boolean } {
        return {
            'h-full w-full': this.size === IconSize.FIT,
            'w-2': this.size === IconSize.XXS,
            'w-4': this.size === IconSize.XS,
            'w-6': this.size === IconSize.S,
            'w-8': this.size === IconSize.M,
            'w-16': this.size === IconSize.L,
        };
    }

    ngAfterViewInit() {
        // Set transition only after initial load, so there is no weird initial animations
        this.getHostElement().classList.add('transition-all');

        setHostClassNames(this.getSizeClasses(), this.getHostElement());
    }

    private applyChanges() {
        applyIconDirection(this.direction, this.baseDirection, this.getHostElement());
    }

    protected getHostElement(): HTMLElement {
        return this._elementRef.nativeElement.querySelector<HTMLElement>('svg') ?? this._elementRef?.nativeElement;
    }
}

