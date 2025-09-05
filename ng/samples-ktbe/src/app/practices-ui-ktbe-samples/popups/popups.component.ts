import { DIALOG_DATA } from '@angular/cdk/dialog';
import { Component, ElementRef, HostBinding, inject, ViewChild } from '@angular/core';
import { StatusService } from '@nexplore/practices-ui';
import {
    FLYOUT_PROVIDERS,
    MODAL_PROVIDERS,
    PracticesKtbeDialogModule,
    PUIBE_DIALOG_ACTIONS,
    PUIBE_DIALOG_PRESETS,
    PuibeActionDialogConfig,
    PuibeActionDialogService,
    PuibeDialogActionMap,
    PuibeFlyoutService,
    PuibeModalService,
    PuibeStatusHubComponent,
    PuibeTeaserComponent,
} from '@nexplore/practices-ui-ktbe';
import { map, timer } from 'rxjs';

import { AppFlyoutComponent } from './flyout.component';
import { AppModalComponent } from './modal.component';

@Component({
    standalone: true,
    selector: 'app-popups',
    templateUrl: 'popups.component.html',
    imports: [PracticesKtbeDialogModule, PuibeStatusHubComponent, PuibeTeaserComponent],
    providers: [...MODAL_PROVIDERS, ...FLYOUT_PROVIDERS], // TODO: Normally you would probably `importProvidersFrom(PracticesKtbeDialogModule)` in the bootstrap module
})
export class AppPopupsComponent {
    @HostBinding('class')
    className = 'flex flex-col gap-4';

    @ViewChild('openFlyoutButton', { read: ElementRef<HTMLElement>, static: true })
    protected flyoutButtonRef: ElementRef<HTMLElement>;

    openConfirmDelete = this._actionDialog.createShowCommand(
        PUIBE_DIALOG_PRESETS.confirmDelete((args: { specialNumber: number }) =>
            timer(1000).pipe(
                map(() => {
                    this._status.showSuccessMessage(
                        `Additional message, passed in argument was ${args?.specialNumber}`
                    );
                    return true;
                })
            )
        )
    );

    openConfirmDiscard = this._actionDialog.createShowCommand(
        PUIBE_DIALOG_PRESETS.confirmDiscardUnsavedChanges(true),
        {}
    );

    constructor(
        private readonly _modalService: PuibeModalService,
        private readonly _flyoutService: PuibeFlyoutService,
        private readonly _actionDialog: PuibeActionDialogService,
        private readonly _status: StatusService
    ) {}

    openModal(): void {
        const ref = this._modalService.open(AppModalComponent, {
            data: { name: 'diamonds' },
        });

        ref.closed.subscribe((data) => console.log('Closed with data', data));
    }

    openFlyout(): void {
        this._flyoutService.open(
            AppFlyoutComponent,
            {
                data: { name: 'rubies' },
                showArrowTips: true,
            },
            this.flyoutButtonRef.nativeElement
        );
    }

    openConfirmCustom = async () => {
        // Call dialog with simple yes/no choice
        const choice = await this._actionDialog.showAsync({
            actions: [PUIBE_DIALOG_ACTIONS.YES, PUIBE_DIALOG_ACTIONS.NO],
            title: 'Did you know?',
            content: 'You can use your own text and action configurations.',
        });

        if (choice === PUIBE_DIALOG_ACTIONS.YES) {
            // Async handler with custom (boolean) result
            const he_already_knew = await this._actionDialog.showAsync<boolean>({
                actions: { YES: true, NO: () => timer(1500).pipe(map(() => false)) },
                title: 'But did you know...',
                content: 'You can easily run asynchronous actions and return custom results? Click NEIN, to find out.',
            });

            if (he_already_knew) {
                this._status.showSuccessMessage('Well, then you already know everything it seems. Good luck to you!');
                return;
            }
        }

        // Create a custom button template
        const customActionsTemplate = {
            THROW_ERROR: { label: 'Throw error' },
            RETURN_SUCCESS: { label: 'Calculate answer', primary: true },
            CANCEL: PUIBE_DIALOG_ACTIONS.CANCEL,
        };

        // Define a preset function (This is basically how the default `PUIBE_DIALOG_PRESETS` are defined)
        const customActionDialogPreset = <TResult>(
            actions: PuibeDialogActionMap<typeof customActionsTemplate, TResult>
        ): PuibeActionDialogConfig<
            | typeof customActionsTemplate.THROW_ERROR
            | typeof customActionsTemplate.RETURN_SUCCESS
            | typeof customActionsTemplate.CANCEL,
            TResult | false,
            typeof customActionsTemplate // <-- Alternatively, you can leave this type parameter empty, and it will use the default `PUIBE_DIALOG_ACTIONS`
        > => ({
            actions: { ...actions, CANCEL: false }, // Cancel directly returns false
            actionTemplates: customActionsTemplate,
            title: 'Everything is possible',
            content:
                'This action dialog can do everything you need, custom buttons, custom texts, and do you want to know, what else it can do?',
        });

        const result = await this._actionDialog.showAsync(
            customActionDialogPreset({
                // Notice the possibility to use commands here
                RETURN_SUCCESS: () => timer(4500).pipe(map(() => ({ answer: '42' }))),
                THROW_ERROR: () =>
                    timer(500).pipe(
                        map(() => {
                            throw new Error('Told you so, there you have your error!');
                        })
                    ),
            })
        );

        if (result) {
            await this._actionDialog.showAsync(
                {
                    actions: { OK: () => timer(500) },
                    title: 'The answer to everything',
                    // eslint-disable-next-line @typescript-eslint/no-use-before-define
                    content: AnswerToEverythingComponent,
                },
                {
                    data: result,
                }
            );
        }
    };

    openConfirmNoContent = async () => {
        await this._actionDialog.showAsync({
            actions: [PUIBE_DIALOG_ACTIONS.OK],
            title: 'I only have a title!',
        });
    };
}

// eslint-disable-next-line @typescript-eslint/no-use-before-define
@Component({
    standalone: true,
    selector: 'app-answer-to-everything',
    template: `<p>You might have guessed it, the answer is:</p>
        <h3>{{ data?.answer ?? 'ERROR' }}</h3>`,
})
class AnswerToEverythingComponent {
    data = inject<{ answer: string }>(DIALOG_DATA);
}
