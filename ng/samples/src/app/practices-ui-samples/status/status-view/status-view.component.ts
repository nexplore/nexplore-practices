import { Component } from '@angular/core';
import { StatusService } from '@nexplore/practices-ui';
import { interval, of } from 'rxjs';
import { delay, map, take } from 'rxjs/operators';

@Component({
    selector: 'app-status-view',
    templateUrl: './status-view.component.html',
})
export class StatusViewComponent {
    constructor(private statusService: StatusService) {}

    register3SecondQuery() {
        this.statusService.registerQuery(of(true).pipe(delay(3000))).subscribe();
    }

    registerClientUnsubscribingQuery() {
        this.statusService.registerQuery(interval(1000).pipe(take(2))).subscribe();
    }

    registerQueryWithError() {
        this.statusService
            .registerQuery(
                interval(1000).pipe(
                    map(() => {
                        throw new Error('The query failed');
                    })
                )
            )
            .subscribe();
    }

    registerActionWithDefaultSuccessMessage() {
        this.statusService.registerAction(of(true).pipe(delay(1000))).subscribe();
    }

    registerActionWithCustomSuccessMessage() {
        this.statusService
            .registerAction(of(true).pipe(delay(1000)), 'The action completed with a custom message')
            .subscribe();
    }

    registerActionWithDefaultErrorMessage() {
        this.statusService
            .registerAction(
                interval(1000).pipe(
                    map(() => {
                        throw new Error('The action failed');
                    })
                )
            )
            .subscribe();
    }

    registerActionWithCustomErrorMessage() {
        this.statusService
            .registerAction(
                interval(1000).pipe(
                    map(() => {
                        throw new Error('The action failed');
                    })
                ),
                undefined,
                'The action failed with a custom message'
            )
            .subscribe();
    }
}
