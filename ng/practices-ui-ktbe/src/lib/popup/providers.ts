import { Dialog } from '@angular/cdk/dialog';
import { PuibeActionDialogService } from './action-dialog.service';
import { PuibeModalService } from './modal.service';

export const MODAL_PROVIDERS = [Dialog, PuibeModalService, PuibeActionDialogService];
