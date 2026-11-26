import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { ElementRef, Injectable, inject } from '@angular/core';
import { takeUntil } from 'rxjs';
import { PuiCalendarFlyoutComponent } from '../calendar/calendar-flyout.component';
import { PuiCalendarComponent } from '../calendar/calendar.component';

export interface PuiCalendarFlyoutRef {
    close: () => void;
    overlayRef: OverlayRef;
    calendar: PuiCalendarComponent;
}
@Injectable({ providedIn: 'root' })
export class PuiCalendarFlyoutService {
    private _overlayService = inject(Overlay);

    openCalendarFlyout({
        anchorRef,
        side,
        configureCalendar,
        onClose,
    }: {
        anchorRef: ElementRef<HTMLElement>;
        side: 'start' | 'end';
        configureCalendar: (calendar: PuiCalendarComponent) => void;
        onClose: () => void;
    }): PuiCalendarFlyoutRef {
        const pos = this._overlayService
            .position()
            .flexibleConnectedTo(anchorRef)
            .withPositions([
                // Prefered position is underneath the input
                {
                    originX: side,
                    originY: 'bottom',
                    overlayX: side,
                    overlayY: 'top',
                    weight: 100,
                    offsetY: 4,
                },
                // If it does not fit, then position over on top
                {
                    originX: side,
                    originY: 'top',
                    overlayX: side,
                    overlayY: 'bottom',
                    weight: 90,
                    offsetY: 4,
                },
            ]);

        const overlayRef = this._overlayService.create({
            positionStrategy: pos,
            scrollStrategy: this._overlayService.scrollStrategies.block(),
            hasBackdrop: true, // needed to capture the backdropClick to close datepicker overlay
            backdropClass: 'cdk-overlay-transparent-backdrop',
        });

        // Create ComponentPortal that can be attached to a PortalHost
        const portal = new ComponentPortal(PuiCalendarFlyoutComponent);

        // Attach ComponentPortal to PortalHost
        const _calendarOverlayRef = overlayRef.attach(portal);

        const closeHandler = () => {
            onClose();
            _calendarOverlayRef.destroy();
            overlayRef.dispose();
        };

        overlayRef.backdropClick().subscribe(() => {
            closeHandler();
        });

        _calendarOverlayRef.instance.cancelClick.pipe(takeUntil(overlayRef.detachments())).subscribe(() => {
            closeHandler();
        });

        const calendar = _calendarOverlayRef.instance.calendar;

        calendar.blurHandler = () => setTimeout(() => closeHandler());
        configureCalendar(calendar);

        calendar.focus();

        return { close: closeHandler, overlayRef, calendar };
    }
}

