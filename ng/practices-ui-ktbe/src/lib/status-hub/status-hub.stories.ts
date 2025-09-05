import { Component, HostBinding, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LegacyCommand, StatusCategory, StatusHubConfig, StatusService } from '@nexplore/practices-ui';
import { NgSelectModule } from '@ng-select/ng-select';
import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { BehaviorSubject, map, merge, Observable, takeWhile, timer } from 'rxjs';
import { PuibeFormFieldComponent, PuibeLabelDirective, PuibeSelectDirective } from '../../index';
import { PuibeButtonDirective } from '../button/button.directive';
import { PuibeExpansionPanelComponent } from '../expansion-panel/expansion-panel.component';
import { PuibeErrorStatusDirective } from './status-error.directive';
import { PuibeStatusHubComponent } from './status-hub.component';

type Args = {} & StatusHubConfig;

@Component({
    selector: 'puibe-status-hub-story',
    standalone: true,
    template: `
        <div class="flex gap-2">
            <button puibeButton (click)="genError()">create error</button>
            <button puibeButton (click)="genSuccess()">create success</button>
            <button puibeButton (click)="toggleBusyWithMessage()">toggle busy (with message)</button>
            <button puibeButton (click)="toggleBusyBlocking()">block ui</button>
            <button puibeButton [clickCommand]="doubleErrorCommand">create error from command</button>
        </div>
        <div class="flex items-center justify-stretch gap-2">
            <button puibeButton (click)="registerQuery()">register query or action</button>
            <puibe-form-field class="max-w-80 flex-auto">
                <label puibeLabel>Status Category</label>
                <ng-select
                    puibeInput
                    [(ngModel)]="statusCategory"
                    [items]="categories"
                    placeholder="Status Category"
                ></ng-select>
            </puibe-form-field>
        </div>
    `,
    imports: [
        PuibeButtonDirective,
        PuibeFormFieldComponent,
        PuibeSelectDirective,
        PuibeLabelDirective,
        NgSelectModule,
        FormsModule,
    ],
})
class StatusHubStoryComponent {
    @HostBinding('class')
    className = 'flex flex-col gap-4';
    statusService = inject(StatusService);

    categories = ['query', 'query-list', 'action', 'action-save', 'action-delete'];
    statusCategory: StatusCategory;

    busyS = new BehaviorSubject<boolean>(false);

    doubleErrorCommand = LegacyCommand.create(() => {
        return this.statusService.registerAction(
            new Observable((s) => {
                setTimeout(() => s.error(new Error('Test error 2')), 100);
            })
        );
    });

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

const meta: Meta<Args> = {
    title: 'PUIBE/status-hub',
    component: PuibeStatusHubComponent,
    tags: ['autodocs'],
    argTypes: {
        busyAsSilentByDefault: { type: 'boolean' },
    },
    decorators: [
        moduleMetadata({
            imports: [
                PuibeStatusHubComponent,
                StatusHubStoryComponent,
                PuibeErrorStatusDirective,
                PuibeExpansionPanelComponent,
            ],
        }),
    ],
    render: (args) => ({
        props: {
            ...args,
            config: args,
        },
        template: `<puibe-status-hub-story></puibe-status-hub-story>
        <puibe-status-hub [statusHubConfig]="config">
        <ng-container *puibeIfErrorStatus="let status;">
            Etwas ist schief gelaufen!
            <puibe-expansion-panel *ngIf="status.error?.stack" caption="Details" class="text-black flex-grow-0" [enableContentScroll]="true">
                <code *ngIf="status.error.stack" class="whitespace-pre">{{ status?.error.stack }}</code>
            </puibe-expansion-panel>
        </ng-container>
        </puibe-status-hub>`,
    }),
};

export default meta;

type Story = StoryObj<Args>;

export const Default: Story = {
    args: {},
};
