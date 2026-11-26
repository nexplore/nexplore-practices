import { DialogModule } from '@angular/cdk/dialog';
import { NgModule } from '@angular/core';
import {
    MODAL_PROVIDERS,
    PuiModalComponent,
    PuiModalContentDirective,
    PuiModalFooterActionDirective,
    PuiModalSubtitleComponent,
    PuiModalSubtitleDirective,
    PuiModalTitleComponent,
    PuiModalTitleDirective,
} from '.';

const DEFAULT_DIALOG_COMPONENTS = [
    PuiModalComponent,
    PuiModalTitleDirective,
    PuiModalSubtitleDirective,
    PuiModalContentDirective,
    PuiModalFooterActionDirective,
    PuiModalTitleComponent,
    PuiModalSubtitleComponent,
    DialogModule,
];

@NgModule({
    providers: MODAL_PROVIDERS,
    imports: DEFAULT_DIALOG_COMPONENTS,
    exports: DEFAULT_DIALOG_COMPONENTS,
})
export class PracticesTailwindDialogModule {}

