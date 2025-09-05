import { DIALOG_SCROLL_STRATEGY_PROVIDER, Dialog } from '@angular/cdk/dialog';
import { PuibeActionDialogService } from './action-dialog.service';
import { PuibeModalService } from './modal.service';

export const MODAL_PROVIDERS = [DIALOG_SCROLL_STRATEGY_PROVIDER, Dialog, PuibeModalService, PuibeActionDialogService];
