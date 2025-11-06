import { NgModule } from '@angular/core';
import {
    MODAL_PROVIDERS,
    PuibeModalComponent,
    PuibeModalContentDirective,
    PuibeModalFooterActionDirective,
    PuibeModalSubtitleComponent,
    PuibeModalSubtitleDirective,
    PuibeModalTitleComponent,
    PuibeModalTitleDirective,
} from '.';
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
