import { inject, Provider } from '@angular/core';
import { provideDirtyGuard } from '@nexplore/practices-ng-dirty-guard';
import { PuibeActionDialogService } from '../popup/action-dialog.service';
import { PUIBE_DIALOG_PRESETS } from '../popup/action-dialog.types';

export function providePuibeDirtyGuard(): Provider {
    return provideDirtyGuard({
        evaluateDiscardChangesAsyncHandler: () => {
            const actionDlgService = inject(PuibeActionDialogService);
            return actionDlgService.showAsync(PUIBE_DIALOG_PRESETS.confirmDiscardUnsavedChanges(true));
        },
    });
}
