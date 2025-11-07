import { inject, Provider } from '@angular/core';
import { provideDirtyGuard } from '@nexplore/practices-ng-dirty-guard';
import { PuiActionDialogService } from '../popup/action-dialog.service';
import { PUIBE_DIALOG_PRESETS } from '../popup/action-dialog.types';

export function providePuiDirtyGuard(): Provider {
    return provideDirtyGuard({
        evaluateDiscardChangesAsyncHandler: () => {
            const actionDlgService = inject(PuiActionDialogService);
            return actionDlgService.showAsync(PUIBE_DIALOG_PRESETS.confirmDiscardUnsavedChanges(true));
        },
    });
}

