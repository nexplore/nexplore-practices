import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ClarityModule } from '@clr/angular';

import { FilterableListViewSourceComponent } from './list/filterable-list-view-source/filterable-list-view-source.component';
import { ListViewSourceComponent } from './list/list-view-source/list-view-source.component';
import { ListViewComponent } from './list/list-view/list-view.component';
import { PRACTICES_UI_SAMPLES_ROUTES } from './practices-ui-samples.routes';
import { StatusViewComponent } from './status/status-view/status-view.component';
import { SubnavigationComponent } from './subnavigation/subnavigation.component';

@NgModule({
    imports: [CommonModule, RouterModule.forChild(PRACTICES_UI_SAMPLES_ROUTES), ClarityModule, FormsModule],
    declarations: [
        SubnavigationComponent,
        ListViewComponent,
        FilterableListViewSourceComponent,
        ListViewSourceComponent,
        StatusViewComponent,
    ],
})
export class PracticesUiSamplesModule {}
