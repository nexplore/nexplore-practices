import { DialogModule } from '@angular/cdk/dialog';

import { Component, inject, TemplateRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LegacyCommand } from '@nexplore/practices-ui';
import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { map, timer } from 'rxjs';
import { PracticesTailwindFormComponentsModule } from '../../form.module';
import { PuiButtonDirective } from '../button/button.directive';
import { PuiActionDialogService } from './action-dialog.service';
import { PUIBE_DIALOG_ACTIONS, PUIBE_DIALOG_PRESETS } from './action-dialog.types';
import { PuiFlyoutService } from './flyout.service';
import { MODAL_PROVIDERS } from './providers';

/* Component to open modals from buttons */
@Component({
    standalone: true,
    selector: 'app-launcher',
    template: ` <div class="flex flex-col gap-4">
            <button puiButton (click)="confirmation()">open confirmation</button>

            <button puiButton [clickCommand]="openConfirmDiscard">Click to open action UNSAVED CHANGES dialog</button>
            <button puiButton [clickCommand]="openConfirmDelete">Click to open action DELETE dialog</button>
            <button puiButton [clickCommand]="formDialogCommand">Click to open action FORM dialog</button>
        </div>

        <ng-template #formDlgTmpl>
            <form [formGroup]="form">
                <pui-form-field>
                    <label puiLabel>name</label>
                    <input puiInput type="text" formControlName="name" />
                </pui-form-field>

                <pui-form-field>
                    <label puiLabel>birthdate</label>
                    <input puiInput type="date" formControlName="birthdate" />
                </pui-form-field>
            </form>
        </ng-template>`,
    providers: [...MODAL_PROVIDERS],
    imports: [
    PuiButtonDirective,
    DialogModule,
    ReactiveFormsModule,
    PracticesTailwindFormComponentsModule
],
})
class LaunchComponent {
    private readonly _actionDialog = inject(PuiActionDialogService);

    @ViewChild('formDlgTmpl', { static: true })
    protected readonly formDlgTmpl: TemplateRef<any>;

    protected readonly form = new FormGroup({
        name: new FormControl(''),
        birthdate: new FormControl<Date | null>(null, Validators.required),
    });

    protected readonly formDialogCommand = this._actionDialog.createShowCommand<void>(() => ({
        title: 'Form dialog',
        actions: [PUIBE_DIALOG_ACTIONS.SAVE, PUIBE_DIALOG_ACTIONS.CANCEL],
        content: this.formDlgTmpl,
    }));

    protected readonly openConfirmDelete = LegacyCommand.create(
        () => {
            return this._actionDialog.showAsync(
                PUIBE_DIALOG_PRESETS.confirmDelete(() => timer(1000).pipe(map(() => true))),
            );
        },
        { successMessage: (result) => (result === true ? 'Successfully deleted the item!' : null) },
    );

    protected async confirmation() {
        const result = await this._actionDialog.showAsync<{ id: number }>({
            title: 'Do you read?',
            content: 'Please confirm that you read this.',
            actions: { CONFIRM: () => timer(1000).pipe(map(() => ({ id: 42 }))), CANCEL: false },
        });

        if (result) {
            await this._actionDialog.showAsync({
                title: 'And the result is...',
                content: result.id?.toString(),
                actions: [PUIBE_DIALOG_ACTIONS.OK],
            });
        }
    }

    protected openConfirmDiscard = () => {
        return this._actionDialog.showAsync(PUIBE_DIALOG_PRESETS.confirmDiscardUnsavedChanges(true));
    };
}

type Args = {};

const meta: Meta<Args> = {
    title: 'PUIBE/action-dialog',
    component: LaunchComponent,
    tags: ['autodocs'],
    decorators: [
        moduleMetadata({
            imports: [PuiButtonDirective],
            providers: [PuiFlyoutService],
        }),
    ],
    argTypes: {},
};

export default meta;
export const actionDialog: StoryObj = {};

