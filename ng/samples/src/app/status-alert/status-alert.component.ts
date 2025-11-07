import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { AggregatedStatusInfo, StatusError, StatusHubService, StatusSuccess } from '@nexplore/practices-ui';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-status-alert',
    templateUrl: './status-alert.component.html',
})
export class StatusAlertComponent implements OnInit, OnDestroy {
    private statusHub = inject(StatusHubService);

    private subscription: Subscription;
    busy: boolean;

    error: StatusError;
    success: StatusSuccess;

    successDismissFn: () => void;
    errorDismissFn: () => void;

    ngOnInit() {
        this.subscription = this.statusHub.status$.subscribe((status) => this.setStatus(status));
    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    private setStatus(status: AggregatedStatusInfo) {
        this.busy = status.busy;
        this.success = status.success;
        this.error = status.error;
        this.successDismissFn = () => status.dismissSuccess();
        this.errorDismissFn = () => status.dismissError();
    }

    getSuccessMessage() {
        if (!this.success) {
            return undefined;
        }

        if (typeof this.success === 'boolean') {
            return 'Default Success Message';
        } else {
            return this.success;
        }
    }

    getErrorMessage() {
        if (!this.error) {
            return undefined;
        }

        if (typeof this.error === 'boolean') {
            return 'Default Error Message';
        } else {
            return this.error;
        }
    }
}
