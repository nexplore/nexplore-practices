/* eslint-disable @typescript-eslint/dot-notation */
import { A11yModule } from '@angular/cdk/a11y';
import { BlockScrollStrategy, ViewportRuler } from '@angular/cdk/overlay';
import { AsyncPipe, NgClass, NgTemplateOutlet } from '@angular/common';
import { Component, ContentChild, EventEmitter, Input, Output, inject } from '@angular/core';
import {
    AggregatedStatusInfo,
    StatusCategory,
    StatusEvent,
    StatusEventExt,
    StatusHubConfig,
    StatusHubService,
} from '@nexplore/practices-ui';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { combineLatest, debounceTime, defer, delay, map, of, switchMap, tap } from 'rxjs';
import { PuiIconSpinnerComponent } from '../icons/icon-spinner.component';
import { IconSize } from '../icons/icon.interface';
import { PuiStatusToastComponent } from '../status-toast/status-toast.component';
import { PuiToastComponent } from '../toast/toast.component';
import { listEntryAnimation, scaleAnimation, slowFadeAnimation } from './animations';
import { PuiErrorStatusDirective } from './status-error.directive';

type ToastPosition = 'top-left' | 'top' | 'top-right' | 'bottom-left' | 'bottom' | 'bottom-right';

@Component({
    selector: 'pui-status-hub',
    standalone: true,
    templateUrl: './status-hub.component.html',
    imports: [
        PuiStatusToastComponent,
        PuiToastComponent,
        PuiIconSpinnerComponent,
        NgClass,
        NgTemplateOutlet,
        AsyncPipe,
        TranslateModule,
        A11yModule,
    ],
    animations: [listEntryAnimation, scaleAnimation, slowFadeAnimation],
})
export class PuiStatusHubComponent {
    readonly IconSize = IconSize;

    private _statusHub = inject(StatusHubService);
    private _viewportRuler = inject(ViewportRuler);
    private _translate = inject(TranslateService);
    private _blockScroll = new BlockScrollStrategy(this._viewportRuler, document);

    /** @internal For debugging and diagnostics only (Angular Dev tools) */
    data: any = {};

    @ContentChild(PuiErrorStatusDirective, { static: true }) readonly statusError!: PuiErrorStatusDirective;

    /**
     * Allows to override the default configuration of the status hub service.
     */
    @Input()
    set statusHubConfig(value: Partial<StatusHubConfig>) {
        this._statusHub.config = { ...this._statusHub.config, ...value };
    }

    get statusHubConfig(): StatusHubConfig {
        return this._statusHub.config;
    }

    /**
     * Configures the time in milliseconds, that incoming message/error-alerts will be throttled, to prevent flickering and information-overload.
     */
    @Input()
    alertThrottleTimeMs = 100;

    /**
     * Configures the time in milliseconds, which the busy spinner will wait until shown, preventing flickering and information-overload.
     */
    @Input()
    spinnerThrottleTimeMs = 2000;

    @Input()
    disableDefaultProgressMessage = false;

    @Input()
    set position(value: ToastPosition) {
        this.positionClasses = this._getPositionClasses(value);
    }

    @Output()
    dismissed = new EventEmitter<StatusEventExt>();

    positionClasses: string = this._getPositionClasses('bottom-left');

    readonly progressMessage$ = this._statusHub.status$.pipe(
        tap((aggregatedStatus) => (this.data.aggregatedStatus = aggregatedStatus)),
        map((s) => this._getProgressMessage(s)),
        switchMap((message, i) =>
            message && i > 0 ? of(message).pipe(delay(this.spinnerThrottleTimeMs)) : of(message),
        ), // Notice the delay prevents flickering
    );

    readonly busyNoMessage$ = combineLatest([this._statusHub.status$, this.progressMessage$]).pipe(
        map(([status, message]) => (message ? false : status.busy)),
        tap((busy) => (this.data.busyNoMessage = busy)),
        switchMap((message, i) =>
            message && i > 0 ? of(message).pipe(delay(this.spinnerThrottleTimeMs)) : of(message),
        ), // Notice the delay prevents flickering of the spinner
    );

    readonly busyAndBlocking$ = this._statusHub.busyAndBlocking$.pipe(
        tap((busyAndBlocking) => {
            this.data.busyAndBlocking = busyAndBlocking;
            if (busyAndBlocking) {
                this._blockScroll.enable();
            } else {
                this._blockScroll.disable();
            }
        }),
    );

    readonly statusToasts$ = defer(() => this._statusHub.getLatestStatusEventsWithConfig$(this.statusHubConfig)).pipe(
        tap((evs) => {
            this.data.statusToasts = evs;
        }),
        debounceTime(this.alertThrottleTimeMs), // Debounce to prevent extreme fast flickering
    );

    readonly trackByFn = (i: number, item: StatusEvent): number | undefined => item.timestamp ?? i;

    private _getProgressMessage(status: AggregatedStatusInfo): string | null {
        if (status.progressMessage) {
            return status.progressMessage;
        }

        if (!this.disableDefaultProgressMessage && status.statusCategory) {
            const key = this._getMessageKeyForStatusCategory(status.statusCategory);
            if (key) {
                return this._translate.instant(key);
            }
        }

        return null;
    }

    private _getMessageKeyForStatusCategory(statusCategory: StatusCategory): string | null {
        switch (statusCategory) {
            case 'action':
                return 'Practices.Labels_Status_Action';
            case 'action-delete':
                return 'Practices.Labels_Status_Action_Delete';
            case 'action-save':
                return 'Practices.Labels_Status_Action_Save';
            case 'query':
                return 'Practices.Labels_Status_Query';
            case 'query-list':
                return 'Practices.Labels_Status_Query_List';
            default:
                return null;
        }
    }

    private _getPositionClasses(position: ToastPosition) {
        let className = '';
        switch (position) {
            case 'bottom':
                className = 'items-center bottom-0 left-0 right-0 md:bottom-5 lg:bottom-10';
                break;
            case 'bottom-left':
                className = 'items-start bottom-0 left-0 md:bottom-5 md:left-5 lg:bottom-10 lg:left-10';
                break;
            case 'bottom-right':
                className = 'items-end bottom-0 right-0 md:bottom-5 md:right-5 lg:bottom-10 lg:right-10';
                break;
            case 'top':
                className = 'items-center top-0 left-0 right-0 md:top-5 lg:top-10';
                break;
            case 'top-left':
                className = 'items-start top-0 left-0  md:top-5 md:left-5 lg:top-10 lg:left-10';
                break;
            case 'top-right':
                className = 'items-end top-0 right-0 md:top-5 md:right-5 lg:top-10 lg:right-10';
                break;
            default:
                className = '';
                break;
        }
        return className;
    }
}

