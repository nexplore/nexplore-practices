import { CdkOverlayOrigin, ConnectedPosition, Overlay, OverlayModule, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { CommonModule, DOCUMENT } from '@angular/common';
import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    HostListener,
    OnDestroy,
    TemplateRef,
    ViewContainerRef,
    inject,
    input,
    viewChild,
} from '@angular/core';
import { DestroyService } from '@nexplore/practices-ui';
import { takeUntil } from 'rxjs';

type TooltipDirection = 'top' | 'bottom' | 'left' | 'right';

const OVERLAY_POSITIONS: { [K in TooltipDirection]: ConnectedPosition } = {
    top: {
        originX: 'center',
        originY: 'top',
        overlayX: 'center',
        overlayY: 'bottom',
        offsetY: -12,
    },
    bottom: {
        originX: 'center',
        originY: 'bottom',
        overlayX: 'center',
        overlayY: 'top',
        offsetY: 12,
    },
    left: {
        originX: 'start',
        originY: 'center',
        overlayX: 'end',
        overlayY: 'center',
        offsetX: -12,
    },
    right: {
        originX: 'end',
        originY: 'center',
        overlayX: 'start',
        overlayY: 'center',
        offsetX: 12,
    },
};

let nextUniqueId = 0;

@Component({
    standalone: true,
    selector: 'pui-tooltip-button',
    imports: [CommonModule, OverlayModule],
    providers: [DestroyService],
    templateUrl: './tooltip.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'inline-flex align-middle',
    },
})
export class PuiTooltipButtonComponent implements AfterViewInit, OnDestroy {
    private readonly _document = inject<Document>(DOCUMENT);
    private readonly _overlayService = inject(Overlay);
    private readonly _destroy$ = inject(DestroyService);
    private readonly _viewContainerRef = inject(ViewContainerRef);
    private readonly _cdr = inject(ChangeDetectorRef);

    public readonly ariaLabel = input('More information');
    public readonly overlayMaxWidthClass = input('max-w-md');

    private readonly _originSignal = viewChild(CdkOverlayOrigin);
    private readonly _tooltipRefSignal = viewChild(TemplateRef<HTMLDivElement>);

    protected readonly tooltipId = `pui-tooltip-${nextUniqueId++}`;
    protected arrowClass = 'arrowtip-bottom arrowtip-center';
    protected isOpen = false;

    private _overlayRef: OverlayRef | undefined;
    private _templatePortal: TemplatePortal<HTMLDivElement> | undefined;

    @HostListener('document:keydown.escape')
    onEscape() {
        this.close();
    }

    public toggle() {
        if (this._overlayRef?.hasAttached()) {
            this.close();
            return;
        }

        if (!this._overlayRef || !this._templatePortal) {
            return;
        }

        this._overlayRef.attach(this._templatePortal);
        this.isOpen = true;
        this.setOverlayDirection();
        this._cdr.markForCheck();
    }

    public ngAfterViewInit(): void {
        const tooltipRef = this._tooltipRefSignal();
        const origin = this._originSignal();
        if (!tooltipRef || !origin) {
            return;
        }

        this._templatePortal = new TemplatePortal(tooltipRef, this._viewContainerRef);
        this._overlayRef = this._overlayService.create({
            hasBackdrop: true,
            backdropClass: 'cdk-overlay-transparent-backdrop',
            positionStrategy: this.createPositionStrategy(origin, 'top'),
            scrollStrategy: this._overlayService.scrollStrategies.close(),
        });

        this._overlayRef
            .backdropClick()
            .pipe(takeUntil(this._destroy$))
            .subscribe(() => this.close());

        this._overlayRef
            .detachments()
            .pipe(takeUntil(this._destroy$))
            .subscribe(() => {
                this.isOpen = false;
                this._cdr.markForCheck();
            });
    }

    public ngOnDestroy(): void {
        this._overlayRef?.dispose();
    }

    private close() {
        this._overlayRef?.detach();
        this.isOpen = false;
        this._cdr.markForCheck();
    }

    private setOverlayDirection() {
        const origin = this._originSignal();
        if (!origin || !this._overlayRef?.hasAttached()) {
            return;
        }

        const direction = this.findOverlayDirection(origin, this._overlayRef);
        this.arrowClass = this.getArrowClass(direction);
        this._overlayRef.updatePositionStrategy(this.createPositionStrategy(origin, direction));
        this._overlayRef.updatePosition();
    }

    private createPositionStrategy(origin: CdkOverlayOrigin, direction: TooltipDirection) {
        return this._overlayService
            .position()
            .flexibleConnectedTo(origin.elementRef)
            .withFlexibleDimensions(true)
            .withPush(true)
            .withGrowAfterOpen(true)
            .withPositions([OVERLAY_POSITIONS[direction]]);
    }

    private findOverlayDirection(origin: CdkOverlayOrigin, overlayRef: OverlayRef): TooltipDirection {
        const defaultWindow = this._document.defaultView;
        if (!defaultWindow) {
            return 'top';
        }

        const { top, left, width, height } = origin.elementRef.nativeElement.getBoundingClientRect();
        const { width: overlayWidth, height: overlayHeight } = overlayRef.overlayElement.getBoundingClientRect();
        const spaceTop = top;
        const spaceLeft = left;
        const spaceRight = defaultWindow.innerWidth - (spaceLeft + width);
        const spaceBottom = defaultWindow.innerHeight - (spaceTop + height);

        if (spaceTop >= overlayHeight) {
            return 'top';
        }

        if (spaceBottom >= overlayHeight) {
            return 'bottom';
        }

        if (spaceRight >= overlayWidth) {
            return 'right';
        }

        if (spaceLeft >= overlayWidth) {
            return 'left';
        }

        return 'top';
    }

    private getArrowClass(direction: TooltipDirection): string {
        return {
            top: 'arrowtip-bottom arrowtip-center',
            bottom: 'arrowtip-top arrowtip-center',
            left: 'arrowtip-right arrowtip-center',
            right: 'arrowtip-left arrowtip-center',
        }[direction];
    }
}
