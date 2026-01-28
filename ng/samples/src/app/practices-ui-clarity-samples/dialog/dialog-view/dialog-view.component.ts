import { Component } from '@angular/core';
import { DialogAction, DialogService } from '@nexplore/practices-ui-clarity';
import { TranslateService } from '@ngx-translate/core';
import { timer } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
    selector: 'app-dialog-view',
    templateUrl: './dialog-view.component.html',
    standalone: false
})
export class DialogViewComponent {
    confirmDialogResponse: boolean | undefined;
    confirmAsyncDialogResponse: boolean | undefined;
    deletionConfirmDialogResponse: boolean | undefined;
    deletionWithHtmlMessageConfirmDialogResponse: boolean | undefined;
    chooseLanguageResponse: string | undefined;

    constructor(private dialogService: DialogService, private translateService: TranslateService) {}

    openAlertDialog() {
        this.dialogService
            .alert('Restart required', 'After completing this action, you will need to restart your computer.', 'OK')
            .subscribe();
    }

    openAlertAsyncDialog() {
        this.dialogService
            .alertAsync(
                'Workflow completed',
                'The workflow is completed. You need to wait 3 seconds for this dialog to close.',
                () => timer(3000),
                'OK',
                'btn-success',
                true
            )
            .subscribe();
    }

    openConfirmDialog() {
        this.dialogService
            .confirm('Confirmation', 'Do you really want to confirm this action?')
            .subscribe((response) => (this.confirmDialogResponse = response));
    }

    openConfirmAsyncDialog() {
        this.dialogService
            .confirmAsync<boolean | number>('Confirmation', 'Do you really want wait 3 seconds?', () => timer(3000))
            .subscribe((response) => (this.confirmAsyncDialogResponse = response === 0));
    }

    openDeletionConfirmDialog() {
        this.dialogService
            .confirm('Delete Confirmation', 'Do you really want to delete this?', 'Delete', 'Cancel', 'btn-danger')
            .subscribe((response) => (this.deletionConfirmDialogResponse = response));
    }

    openDeletionWithHtmlMessageConfirmDialog() {
        this.dialogService
            .confirm(
                'Delete Confirmation',
                this.translateService.instant('Practices.DeleteConfirmationHtmlMessage', {
                    attentionLevel: 'careful',
                }),
                'Delete',
                'Cancel',
                'btn-danger',
                true
            )
            .subscribe((response) => (this.deletionWithHtmlMessageConfirmDialogResponse = response));
    }

    openChooseLanguageDialog() {
        const germanAction: DialogAction<string> = {
            class: 'btn-outline',
            label: 'German',
            handle: () => 'de',
        };

        const frenchAction: DialogAction<string> = {
            class: 'btn-primary',
            label: 'French',
            handle: () => 'fr',
        };

        const italianAction: DialogAction<string> = {
            class: 'btn-success',
            label: 'Italian',
            handle: () => 'it',
        };

        const englishAction: DialogAction<string> = {
            class: 'btn-danger',
            label: 'English',
            handle: () => 'en',
        };

        const detectLanguageAction: DialogAction<string> = {
            label: 'Detect',
            handle: () => timer(2000).pipe(map(() => 'glibberish')),
        };

        this.dialogService
            .showMessage(
                'Choose language',
                'Please select your display language',
                [germanAction, frenchAction, italianAction, englishAction, detectLanguageAction],
                false
            )
            .subscribe((response: string) => (this.chooseLanguageResponse = response));
    }
}
