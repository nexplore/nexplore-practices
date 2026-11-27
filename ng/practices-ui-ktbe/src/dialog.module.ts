import { NgModule } from '@angular/core';
import { PuibeModalContentDirective } from './lib/popup/modal-content.directive';
import { PuibeModalFooterActionDirective } from './lib/popup/modal-footer-action.directive';
import { PuibeModalSubtitleComponent, PuibeModalSubtitleDirective } from './lib/popup/modal-subtitle.directive';
import { PuibeModalTitleComponent, PuibeModalTitleDirective } from './lib/popup/modal-title.directive';
import { PuibeModalComponent } from './lib/popup/modal.component';
import { MODAL_PROVIDERS } from './lib/popup/providers';
import { DialogModule } from '@angular/cdk/dialog';

const DEFAULT_DIALOG_COMPONENTS = [
    PuibeModalComponent,
    PuibeModalTitleDirective,
    PuibeModalSubtitleDirective,
    PuibeModalContentDirective,
    PuibeModalFooterActionDirective,
    PuibeModalTitleComponent,
    PuibeModalSubtitleComponent,
    DialogModule,
];

@NgModule({
    providers: MODAL_PROVIDERS,
    imports: DEFAULT_DIALOG_COMPONENTS,
    exports: DEFAULT_DIALOG_COMPONENTS,
})
export class PracticesKtbeDialogModule {}
