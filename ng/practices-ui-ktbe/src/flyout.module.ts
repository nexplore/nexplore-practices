import { NgModule } from '@angular/core';
import { PuibeFlyoutContentDirective } from './lib/popup/flyout-content.directive';
import { PuibeFlyoutFooterActionDirective } from './lib/popup/flyout-footer-action.directive';
import { PuibeFlyoutTitleComponent, PuibeFlyoutTitleDirective } from './lib/popup/flyout-title.directive';
import { FLYOUT_PROVIDERS, PuibeFlyoutComponent } from './lib/popup/flyout.component';

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
