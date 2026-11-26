import { NgModule } from '@angular/core';
import {
    FLYOUT_PROVIDERS,
    PuiFlyoutComponent,
    PuiFlyoutContentDirective,
    PuiFlyoutFooterActionDirective,
    PuiFlyoutTitleComponent,
    PuiFlyoutTitleDirective,
} from '.';

const DEFAULT_FLYOUT_COMPONENTS = [
    PuiFlyoutComponent,
    PuiFlyoutTitleDirective,
    PuiFlyoutContentDirective,
    PuiFlyoutFooterActionDirective,
    PuiFlyoutTitleComponent,
];

@NgModule({
    providers: FLYOUT_PROVIDERS,
    imports: DEFAULT_FLYOUT_COMPONENTS,
    exports: DEFAULT_FLYOUT_COMPONENTS,
})
export class PracticesTailwindFlyoutModule {}

