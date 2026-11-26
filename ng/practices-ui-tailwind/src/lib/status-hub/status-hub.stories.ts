import { Component, HostBinding, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LegacyCommand, StatusCategory, StatusHubConfig, StatusService } from '@nexplore/practices-ui';
import { NgSelectModule } from '@ng-select/ng-select';
import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { BehaviorSubject, map, merge, Observable, takeWhile, timer } from 'rxjs';
import { PuiFormFieldComponent, PuiLabelDirective, PuiSelectDirective } from '../../index';
import { PuiButtonDirective } from '../button/button.directive';
import { PuiExpansionPanelComponent } from '../expansion-panel/expansion-panel.component';
import { PuiErrorStatusDirective } from './status-error.directive';
import { PuiStatusHubComponent } from './status-hub.component';

type Args = {} & StatusHubConfig;

@Component({
    selector: 'pui-status-hub-story',
    standalone: true,
    template: `
        <div class="flex gap-2">
            <button puiButton (click)="genError()">create error</button>
            <button puiButton (click)="genSuccess()">create success</button>
            <button puiButton (click)="toggleBusyWithMessage()">toggle busy (with message)</button>
            <button puiButton (click)="toggleBusyBlocking()">block ui</button>
            <button puiButton [clickCommand]="doubleErrorCommand">create error from command</button>
        </div>
        <div class="flex items-center justify-stretch gap-2">
            <button puiButton (click)="registerQuery()">register query or action</button>
            <pui-form-field class="max-w-80 flex-auto">
                <label puiLabel>Status Category</label>
                <ng-select
                    puiInput
                    [(ngModel)]="statusCategory"
                    [items]="categories"
                    placeholder="Status Category"
                ></ng-select>
            </pui-form-field>
        </div>
    `,
    imports: [
        PuiButtonDirective,
        PuiFormFieldComponent,
        PuiSelectDirective,
        PuiLabelDirective,
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
            }),
        );
    });

    genError(): void {
        this.statusService
            .registerQuery(
                new Observable((s) => {
                    setTimeout(() => s.error(new Error('Test error 1')), 100);
                }),
            )
            .subscribe();
    }

    genSuccess(): void {
        this.statusService
            .registerAction(
                new Observable((s) => {
                    setTimeout(() => s.complete(), 3000);
                }),
                'YES IT WORKED',
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
                    timer(12000).pipe(map(() => 'Really, we are almost almost properly there now! Probably...')),
                ),
            })
            .subscribe();
    }
}

const meta: Meta<Args> = {
    title: 'PUIBE/status-hub',
    component: PuiStatusHubComponent,
    tags: ['autodocs'],
    argTypes: {
        busyAsSilentByDefault: { type: 'boolean' },
    },
    decorators: [
        moduleMetadata({
            imports: [
                PuiStatusHubComponent,
                StatusHubStoryComponent,
                PuiErrorStatusDirective,
                PuiExpansionPanelComponent,
            ],
        }),
    ],
    render: (args) => ({
        props: {
            ...args,
            config: args,
        },
        template: `<pui-status-hub-story></pui-status-hub-story>
        <pui-status-hub [statusHubConfig]="config">
        <ng-container *puiIfErrorStatus="let status;">
            Etwas ist schief gelaufen!
            <pui-expansion-panel *ngIf="status.error?.stack" caption="Details" class="text-black flex-grow-0" [enableContentScroll]="true">
                <code *ngIf="status.error.stack" class="whitespace-pre">{{ status?.error.stack }}</code>
            </pui-expansion-panel>
        </ng-container>
        </pui-status-hub>`,
    }),
};

export default meta;

type Story = StoryObj<Args>;

export const Default: Story = {
    args: {},
};

