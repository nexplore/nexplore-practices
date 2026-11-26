import { Dialog } from '@angular/cdk/dialog';
import { PuiActionDialogService } from './action-dialog.service';
import { PuiModalService } from './modal.service';

export const MODAL_PROVIDERS = [Dialog, PuiModalService, PuiActionDialogService];

