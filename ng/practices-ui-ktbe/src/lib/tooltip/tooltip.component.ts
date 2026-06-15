import { CdkOverlayOrigin, ConnectedPosition, Overlay, OverlayModule, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { CommonModule, DOCUMENT } from '@angular/common';
import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    HostBinding,
    HostListener,
    OnDestroy,
    TemplateRef,
    ViewChild,
    ViewContainerRef,
    inject,
    input,
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
    selector: 'puibe-tooltip',
    imports: [CommonModule, OverlayModule, TranslateModule, PuibeTooltipIconComponent],
    providers: [DestroyService],
    templateUrl: './tooltip.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PuibeTooltipComponent implements AfterViewInit, OnDestroy {
    private readonly document = inject<Document>(DOCUMENT);
    readonly overlayService = inject(Overlay);
    private readonly destroy$ = inject(DestroyService);
    readonly viewContainerRef = inject(ViewContainerRef);
    private readonly cdr = inject(ChangeDetectorRef);

    @ViewChild(CdkOverlayOrigin) private readonly origin: CdkOverlayOrigin | undefined;
    @ViewChild(TemplateRef) private readonly signpostRef: TemplateRef<HTMLDivElement> | undefined;

    public readonly signCssClasses: { [K in TooltipDirection]: string } = SIGNPOST_SIGN_CSS_CLASSES;
    public readonly tooltipId = `tooltip-${nextUniqueId++}`;
    public signpostDirection: TooltipDirection = 'top';
    public postTranslationCssStyle = '';

    private overlayRef: OverlayRef | undefined;
    private templatePortal: TemplatePortal<HTMLDivElement> | undefined;
    private overlayObserver: MutationObserver | undefined;

    @HostBinding('class') protected hostClass = 'inline';
    @HostListener('document:keydown.escape') onKeydownHandler() {
        this.overlayRef?.detach();
    }

    public readonly noMaxWidth = input(false);

    public toggle() {
        if (this.overlayRef?.hasAttached()) {
            this.overlayRef?.detach();
            return;
        }
        this.overlayRef?.attach(this.templatePortal);
    }

    public ngAfterViewInit(): void {
        if (!this.signpostRef) {
            return;
        }

        this.templatePortal = new TemplatePortal(this.signpostRef, this.viewContainerRef);

        const scrollStrategy = this.overlayService.scrollStrategies.close();

        const overlayConfig = {
            hasBackdrop: true,
            backdropClass: 'cdk-overlay-transparent-backdrop',
            scrollStrategy,
        };

        this.overlayRef = this.overlayService.create(overlayConfig);

        this.overlayRef
            .backdropClick()
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => this.overlayRef?.detach());

        this.overlayObserver = new MutationObserver(() => this.setOverlayDirection());
        this.overlayObserver.observe(this.overlayRef.overlayElement, {
            attributes: false,
            childList: true,
            subtree: false,
        });
    }

    public ngOnDestroy(): void {
        this.overlayRef?.dispose();
        this.overlayObserver?.disconnect();
    }

    private setOverlayDirection() {
        if (!this.origin || !this.overlayRef) {
            return;
        }
        if (!this.overlayRef.hasAttached()) {
            return;
        }

        this.findOverlayDirection(this.origin, this.overlayRef);

        const positionStrategy = this.overlayService
            .position()
            .flexibleConnectedTo(this.origin.elementRef)
            .withFlexibleDimensions(true)
            .withPush(true)
            .withGrowAfterOpen(true)
            .withPositions([OVERLAY_POSITIONS[this.signpostDirection]]);

        this.overlayRef.updatePositionStrategy(positionStrategy);
        this.overlayRef.updatePosition();

        this.setPostOffset(this.origin, this.overlayRef);

        this.cdr.detectChanges();
    }

    private findOverlayDirection(origin: CdkOverlayOrigin, overlayRef: OverlayRef) {
        const defaultWindow = this.document.defaultView;
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

