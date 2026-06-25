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
import { TranslateModule } from '@ngx-translate/core';
import { takeUntil } from 'rxjs';
import { PuibeTooltipIconComponent } from './tooltip-icon.component';

type TooltipDirection = 'top' | 'bottom' | 'left' | 'right' | 'auto';

const OVERLAY_POSITIONS: { [K in TooltipDirection]: ConnectedPosition } = {
    top: {
        originX: 'center',
        originY: 'top',
        overlayX: 'center',
        overlayY: 'bottom',
    },
    bottom: {
        originX: 'center',
        originY: 'bottom',
        overlayX: 'center',
        overlayY: 'top',
    },
    left: {
        originX: 'start',
        originY: 'center',
        overlayX: 'end',
        overlayY: 'center',
    },
    right: {
        originX: 'end',
        originY: 'center',
        overlayX: 'start',
        overlayY: 'center',
    },
    auto: {
        originX: 'center',
        originY: 'center',
        overlayX: 'center',
        overlayY: 'center',
    },
};

const SIGNPOST_SIGN_CSS_CLASSES: { [K in TooltipDirection]: string } = {
    top: 'flex-col',
    bottom: 'flex-col-reverse',
    left: 'flex-row',
    right: 'flex-row-reverse',
    auto: 'flex-col',
};

const SIGNPOST_POST_CSS_STYLES: { [K in TooltipDirection]: string } = {
    top: ` translateY(-13px)`,
    bottom: ` translateY(13px) rotate(180deg)`,
    left: ` translateX(-8px) rotate(270deg)`,
    right: ` translateX(8px) rotate(90deg)`,
    auto: 'display: none',
};

let nextUniqueId = 0;

@Component({
    selector: 'puibe-tooltip-button',
    imports: [CommonModule, OverlayModule, TranslateModule, PuibeTooltipIconComponent],
    providers: [DestroyService],
    templateUrl: './tooltip.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'inline',
    },
})
export class PuibeTooltipButtonComponent implements AfterViewInit, OnDestroy {
    private readonly _document = inject<Document>(DOCUMENT);
    private readonly _overlayService = inject(Overlay);
    private readonly _destroy$ = inject(DestroyService);
    private readonly _viewContainerRef = inject(ViewContainerRef);
    private readonly _cdr = inject(ChangeDetectorRef);

    public readonly overlayMaxWidthClassSignal = input<string>('max-w-md', { alias: 'overlayMaxWidthClass' });

    private readonly _originSignal = viewChild(CdkOverlayOrigin);
    private readonly _signpostRefSignal = viewChild(TemplateRef<HTMLDivElement>);

    protected readonly signCssClasses: { [K in TooltipDirection]: string } = SIGNPOST_SIGN_CSS_CLASSES;
    protected readonly tooltipId = `tooltip-${nextUniqueId++}`;
    protected signpostDirection: TooltipDirection = 'top';
    protected postTranslationCssStyle = '';

    private _overlayRef: OverlayRef | undefined;
    private _templatePortal: TemplatePortal<HTMLDivElement> | undefined;
    private _overlayObserver: MutationObserver | undefined;

    @HostListener('document:keydown.escape') onKeydownHandler() {
        this._overlayRef?.detach();
    }

    public toggle() {
        if (this._overlayRef?.hasAttached()) {
            this._overlayRef?.detach();
            return;
        }
        this._overlayRef?.attach(this._templatePortal);
    }

    public ngAfterViewInit(): void {
        const signpostRef = this._signpostRefSignal();
        if (!signpostRef) {
            return;
        }

        this._templatePortal = new TemplatePortal(signpostRef, this._viewContainerRef);

        const scrollStrategy = this._overlayService.scrollStrategies.close();

        const overlayConfig = {
            hasBackdrop: true,
            backdropClass: 'cdk-overlay-transparent-backdrop',
            scrollStrategy,
        };

        this._overlayRef = this._overlayService.create(overlayConfig);

        this._overlayRef
            .backdropClick()
            .pipe(takeUntil(this._destroy$))
            .subscribe(() => this._overlayRef?.detach());

        this._overlayObserver = new MutationObserver(() => this.setOverlayDirection());
        this._overlayObserver.observe(this._overlayRef.overlayElement, {
            attributes: false,
            childList: true,
            subtree: false,
        });
    }

    public ngOnDestroy(): void {
        this._overlayRef?.dispose();
        this._overlayObserver?.disconnect();
    }

    private setOverlayDirection() {
        const origin = this._originSignal();
        if (!origin || !this._overlayRef) {
            return;
        }
        if (!this._overlayRef.hasAttached()) {
            return;
        }

        this.findOverlayDirection(origin, this._overlayRef);

        const positionStrategy = this._overlayService
            .position()
            .flexibleConnectedTo(origin.elementRef)
            .withFlexibleDimensions(true)
            .withPush(true)
            .withGrowAfterOpen(true)
            .withPositions([OVERLAY_POSITIONS[this.signpostDirection]]);

        this._overlayRef.updatePositionStrategy(positionStrategy);
        this._overlayRef.updatePosition();

        this.setPostOffset(origin, this._overlayRef);

        this._cdr.detectChanges();
    }

    private findOverlayDirection(origin: CdkOverlayOrigin, overlayRef: OverlayRef) {
        const defaultWindow = this._document.defaultView;
        if (defaultWindow) {
            // Determine the direction of the signpost, based on the space around the origin and the size of the overlay
            const { top, left, width, height } = origin.elementRef.nativeElement.getBoundingClientRect();
            const { width: overlayWidth, height: overlayHeight } = overlayRef.overlayElement.getBoundingClientRect();
            const spaceTop = top;
            const spaceLeft = left;
            const spaceRight = defaultWindow.innerWidth - (spaceLeft + width);
            const spaceBottom = defaultWindow.innerHeight - (spaceTop + height);

            const solutions: { [K in TooltipDirection]: boolean } = {
                top: spaceTop >= overlayHeight,
                bottom: spaceBottom >= overlayHeight,
                left: spaceLeft >= overlayWidth,
                right: spaceRight >= overlayWidth,
                auto: true,
            };

            this.signpostDirection = Object.entries(solutions).filter(
                (entry) => entry[1] === true
            )[0][0] as TooltipDirection;
        }
    }

    private setPostOffset(origin: CdkOverlayOrigin, overlayRef: OverlayRef) {
        const { top, left, width, height } = origin.elementRef.nativeElement.getBoundingClientRect();
        const {
            width: overlayWidth,
            height: overlayHeight,
            top: overlayTop,
            left: overlayLeft,
        } = overlayRef.overlayElement.getBoundingClientRect();

        const horizontalCenter = left + width / 2;
        const verticalCenter = top + height / 2;
        const overlayHorizontalCenter = overlayLeft + overlayWidth / 2;
        const overlayVerticalCenter = overlayTop + overlayHeight / 2;

        this.postTranslationCssStyle =
            {
                top: `transform: translateX(${horizontalCenter - overlayHorizontalCenter}px)`,
                bottom: `transform: translateX(${horizontalCenter - overlayHorizontalCenter}px)`,
                left: `transform: translateY(${verticalCenter - overlayVerticalCenter}px)`,
                right: `transform: translateY(${verticalCenter - overlayVerticalCenter}px)`,
                auto: '',
            }[this.signpostDirection] + SIGNPOST_POST_CSS_STYLES[this.signpostDirection];
    }
}
