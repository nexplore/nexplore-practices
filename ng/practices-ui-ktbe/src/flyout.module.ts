import { NgModule } from '@angular/core';
import {
    FLYOUT_PROVIDERS,
    PuibeFlyoutComponent,
    PuibeFlyoutContentDirective,
    PuibeFlyoutFooterActionDirective,
    PuibeFlyoutTitleComponent,
    PuibeFlyoutTitleDirective,
} from '.';

const DEFAULT_FLYOUT_COMPONENTS = [
    PuibeFlyoutComponent,
    PuibeFlyoutTitleDirective,
    PuibeFlyoutContentDirective,
    PuibeFlyoutFooterActionDirective,
    PuibeFlyoutTitleComponent,
];

@NgModule({
    providers: FLYOUT_PROVIDERS,
    imports: DEFAULT_FLYOUT_COMPONENTS,
    exports: DEFAULT_FLYOUT_COMPONENTS,
})
export class PracticesKtbeFlyoutModule {}
