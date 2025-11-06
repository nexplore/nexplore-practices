import { Component, inject, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LegacyCommand, StatusCategory, StatusService } from '@nexplore/practices-ui';
import {
    PracticesKtbeDefaultModule,
    PuibeButtonDirective,
    PuibeErrorStatusDirective,
    PuibeExpansionPanelComponent,
    PuibeFormFieldComponent,
    PuibeLabelDirective,
    PuibeSelectDirective,
    PuibeStatusHubComponent,
    PuibeToastComponent,
} from '@nexplore/practices-ui-ktbe';
import { NgSelectModule } from '@ng-select/ng-select';
import { BehaviorSubject, map, merge, Observable, takeWhile, timer } from 'rxjs';
import { AppComponent } from '../../app.component';

@Component({
    selector: 'puibe-status-hub-story',
    standalone: true,
    templateUrl: './status-hub.component.html',
    imports: [
        PracticesKtbeDefaultModule,
        PuibeButtonDirective,
        PuibeStatusHubComponent,
        PuibeErrorStatusDirective,
        PuibeExpansionPanelComponent,
        PuibeFormFieldComponent,
        PuibeSelectDirective,
        PuibeToastComponent,
        PuibeLabelDirective,
        NgSelectModule,
        FormsModule,
    ],
})
export class StatusHubComponent implements OnDestroy {
    Error = Error;

    statusService = inject(StatusService);

    busyS = new BehaviorSubject<boolean>(false);

    categories = ['query', 'query-list', 'action', 'action-save', 'action-delete'];
    statusCategory: StatusCategory;

    simpleCommand = LegacyCommand.create(() => {
        return timer(3000);
    });
    successCommand = LegacyCommand.create(
        () => {
            return timer(1000);
        },
        { successMessage: 'Yeah it worked!' }
    );
    blockingCommand = LegacyCommand.create(
        () => {
            return timer(4000);
        },
        { blocking: true }
    );
    msgCommand = LegacyCommand.create(
        () => {
            return timer(6000);
        },
        {
            progressMessage: 'Please wait...',
        }
    );
    blockingMsgCommand = LegacyCommand.create(
        () => {
            return timer(6000);
        },
        {
            blocking: true,
            progressMessage: 'Please wait...',
            successMessage: 'The long blocking operation is finally finished!',
        }
    );
    errorCommand = LegacyCommand.create(() => {
        throw new Error('I threw immedeately! ' + Math.random());
    });
    saveCommand = LegacyCommand.create(() => {
        return timer(6000);
    });
    deleteCommand = LegacyCommand.create(() => {
        return timer(6000);
    });
    errorAsyncCommand = LegacyCommand.create(() => {
        return timer(1000).pipe(
            map((_) => {
                throw new Error('Here is your error!');
            })
        );
    });

    constructor(private appComponent: AppComponent) {
        appComponent.overrideStatusHub = true;
    }

    ngOnDestroy(): void {
        this.appComponent.overrideStatusHub = false;
    }

    genError(): void {
        this.statusService
            .registerQuery(
                new Observable((s) => {
                    setTimeout(() => s.error(new Error('Test error 1')), 100);
                })
            )
            .subscribe();
    }

    genSuccess(): void {
        this.statusService
            .registerAction(
                new Observable((s) => {
                    setTimeout(() => s.complete(), 3000);
                }),
                'YES IT WORKED'
            )
            .subscribe();
    }

    registerQuery(): void {
        this.statusService
            .registerQuery(timer(15000), {
                statusCategory: this.statusCategory,
            })
            .subscribe();
    }

    toggleBusy(): void {
        this.busyS.next(!this.busyS.value);
        if (this.busyS.value) {
            this.statusService.registerQuery(this.busyS.asObservable().pipe(takeWhile((b) => b))).subscribe();
        }
    }

    toggleBusyWithMessage(): void {
        this.busyS.next(!this.busyS.value);
        if (this.busyS.value) {
            this.statusService
                .registerQuery(this.busyS.asObservable().pipe(takeWhile((b) => b)), {
                    progressMessage: 'Loading something...',
                })
                .subscribe();
        }
    }

    toggleBusyBlocking(): void {
        this.statusService
            .registerQuery(timer(15000), {
                blocking: true,
                progressMessage: merge(
                    timer(6000).pipe(map(() => 'Please wait...')),
                    timer(9000).pipe(map(() => 'Just a little bit...')),
                    timer(12000).pipe(map(() => 'Really, we are almost almost properly there now! Probably...'))
                ),
            })
            .subscribe();
    }
}
