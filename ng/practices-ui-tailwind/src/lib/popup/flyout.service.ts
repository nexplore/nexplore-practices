import { Dialog, DialogConfig, DialogRef } from '@angular/cdk/dialog';
import {
    ComponentType,
    ConnectedPosition,
    FlexibleConnectedPositionStrategy,
    Overlay,
    PositionStrategy,
} from '@angular/cdk/overlay';
import { Injectable, TemplateRef, inject } from '@angular/core';
import { takeUntil } from 'rxjs';
import { setHostClassNames } from '../util/utils';

export interface PuiFlyoutConfig extends DialogConfig {
    /**
     * The button element that this flyout is attached to.
     */
    buttonRef?: HTMLElement;

    /**
     * Override the possible positions that the flyout can be placed in.
     *
     * This will override `preferredPosition` if set.
     */
    overridePositions?: ConnectedPosition[];

    /** The preferred position that will be applied if possible.
     *
     * If it does not fit, then a series of default positions will be tried.
     *
     * Note: If `overridePositions` is set, then this will be ignored.
     */
    preferredPosition?: ConnectedPosition;

    /**
     * If `true`, displays an little arrow tip on the flyout towards the button.
     */
    showArrowTips?: boolean;
}

const DEFAULT_CONFIG: PuiFlyoutConfig = {
    panelClass: ['bg-white', 'shadow-lg'],
    hasBackdrop: true,
    backdropClass: 'bg-tansparent',
    disableClose: false,
    autoFocus: 'dialog',
    showArrowTips: false,
};

@Injectable()
export class PuiFlyoutService {
    private readonly _dialog = inject(Dialog);
    private readonly _overlay = inject(Overlay);

    private _dialogRef: DialogRef<unknown, unknown> | null = null;

    open<R = unknown>(
        componentOrTemplateRef: ComponentType<unknown> | TemplateRef<unknown>,
        config?: PuiFlyoutConfig,
        buttonRef?: HTMLElement,
    ): DialogRef<R> {
        let positionStrategy: PositionStrategy;

        if (buttonRef) {
            const arrowTipOffsetPx = 8; // The offset is needed as the arrow-tip is not part of the overlay itself. Value is based on the tailwindcss plugin configuration.
            const offset = (config.showArrowTips ?? DEFAULT_CONFIG?.showArrowTips) ? arrowTipOffsetPx : 0;
            positionStrategy =
                config?.positionStrategy ??
                this._overlay
                    .position()
                    .flexibleConnectedTo(buttonRef)
                    .withFlexibleDimensions(true)
                    .withLockedPosition(true)
                    .withPositions(
                        config?.overridePositions instanceof Array
                            ? config.overridePositions
                            : [
                                  ...[config?.preferredPosition].filter((p) => !!p),
                                  {
                                      // First try to position the flyout on the right side of the button
                                      originX: 'start',
                                      originY: 'center',
                                      overlayX: 'end',
                                      overlayY: 'center',
                                      offsetX: offset,
                                  },
                                  {
                                      // Seconldy, try to position the flyout on the left side of the button
                                      originX: 'end',
                                      originY: 'center',
                                      overlayX: 'start',
                                      overlayY: 'center',
                                      offsetX: -offset,
                                  },
                                  {
                                      // Thirdly, try to position the flyout on the bottom of the button
                                      originX: 'center',
                                      originY: 'bottom',
                                      overlayX: 'center',
                                      overlayY: 'top',
                                      offsetY: offset,
                                  },
                                  {
                                      // Finally, try to position the flyout on the top of the button
                                      originX: 'center',
                                      originY: 'top',
                                      overlayX: 'center',
                                      overlayY: 'bottom',
                                      offsetY: -offset,
                                  },
                              ],
                    );
        } else {
            positionStrategy =
                config?.positionStrategy ?? this._overlay.position().global().centerHorizontally().centerVertically();
        }

        const mergedConfig: PuiFlyoutConfig = { ...DEFAULT_CONFIG, ...config, positionStrategy };

        this._dialogRef = this._dialog.open(componentOrTemplateRef as any, mergedConfig as any) as DialogRef<
            unknown,
            unknown
        >;
        this._applyArrowtip(this._dialogRef as DialogRef<unknown, unknown>);
        return this._dialogRef as unknown as DialogRef<R>;
    }

    closeRef(): void {
        if (this._dialogRef) {
            this._dialogRef.close(this._dialogRef.config.data);
            this._dialogRef = null;
        }
    }

    private _applyArrowtip(dialogRef: DialogRef<unknown, unknown>) {
        const flyoutConfig = dialogRef.config as PuiFlyoutConfig;

        if (dialogRef.config.positionStrategy instanceof FlexibleConnectedPositionStrategy) {
            dialogRef.config.positionStrategy.positionChanges
                .pipe(takeUntil(dialogRef.closed))
                .subscribe((position) => {
                    const verticalDirection = `${position.connectionPair.originY}-${position.connectionPair.overlayY}`;
                    const horizontalDirection = `${position.connectionPair.originX}-${position.connectionPair.overlayX}`;
                    const dialogContainer =
                        dialogRef.overlayRef.hostElement.querySelector<HTMLElement>('.cdk-dialog-container');

                    if (!dialogContainer) {
                        return;
                    }

                    setHostClassNames(
                        {
                            'arrowtip-bottom': flyoutConfig?.showArrowTips && verticalDirection === 'top-bottom',
                            'arrowtip-top shadow-[0_-10px_15px_rgba(0,0,0,0.1)]':
                                flyoutConfig?.showArrowTips && verticalDirection === 'bottom-top',
                            'arrowtip-right': flyoutConfig?.showArrowTips && horizontalDirection === 'start-end',
                            'arrowtip-left': flyoutConfig?.showArrowTips && horizontalDirection === 'end-start',
                        },
                        dialogContainer,
                    );

                    const isVertical = verticalDirection === 'top-bottom' || verticalDirection === 'bottom-top';
                    const arrowTipPositionExpr = this._getArrowTipPosition(
                        isVertical ? position.connectionPair.overlayX : position.connectionPair.overlayY,
                    );

                    // The css variable --tw-arrowtip-offset is used by the tailwindcss plugin to position the arrowtip
                    dialogContainer.style.setProperty('--tw-arrowtip-offset', arrowTipPositionExpr);
                });
        }
    }

    private _getArrowTipPosition(position: 'center' | 'start' | 'end' | 'bottom' | 'top') {
        switch (position) {
            case 'center':
                return 'calc(50% - (var(--tw-arrowtip-size) / 2))';
            case 'bottom':
            case 'end':
                return 'calc(100% - var(--tw-arrowtip-size) - 0.5rem)';
            case 'start':
            case 'top':
                return '0.5rem';
        }
    }
}

