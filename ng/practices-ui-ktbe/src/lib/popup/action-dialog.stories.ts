import { DialogModule } from '@angular/cdk/dialog';
import { CommonModule } from '@angular/common';
import { Component, inject, TemplateRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LegacyCommand } from '@nexplore/practices-ui';
import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { map, timer } from 'rxjs';
import { PracticesKtbeFormComponentsModule } from '../../form.module';
import { PuibeButtonDirective } from '../button/button.directive';
import { PuibeActionDialogService } from './action-dialog.service';
import { PUIBE_DIALOG_ACTIONS, PUIBE_DIALOG_PRESETS } from './action-dialog.types';
import { PuibeFlyoutService } from './flyout.service';
import { MODAL_PROVIDERS } from './providers';

/* Component to open modals from buttons */
@Component({
    standalone: true,
    selector: 'app-launcher',
    template: ` <div class="flex flex-col gap-4">
            <button puibeButton (click)="confirmation()">open confirmation</button>

            <button puibeButton [clickCommand]="openConfirmDiscard">Click to open action UNSAVED CHANGES dialog</button>
            <button puibeButton [clickCommand]="openConfirmDelete">Click to open action DELETE dialog</button>
            <button puibeButton [clickCommand]="formDialogCommand">Click to open action FORM dialog</button>
        </div>

        <ng-template #formDlgTmpl>
            <form [formGroup]="form">
                <puibe-form-field>
                    <label puibeLabel>name</label>
                    <input puibeInput type="text" formControlName="name" />
                </puibe-form-field>

                <puibe-form-field>
                    <label puibeLabel>birthdate</label>
                    <input puibeInput type="date" formControlName="birthdate" />
                </puibe-form-field>
            </form>
        </ng-template>`,
    providers: [...MODAL_PROVIDERS],
    imports: [PuibeButtonDirective, DialogModule, CommonModule, ReactiveFormsModule, PracticesKtbeFormComponentsModule],
})
class LaunchComponent {
    private readonly _actionDialog = inject(PuibeActionDialogService);

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
                PUIBE_DIALOG_PRESETS.confirmDelete(() => timer(1000).pipe(map(() => true)))
            );
        },
        { successMessage: (result) => (result === true ? 'Successfully deleted the item!' : null) }
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
            imports: [PuibeButtonDirective],
            providers: [PuibeFlyoutService],
        }),
    ],
    argTypes: {},
};

export default meta;
export const actionDialog: StoryObj = {};
