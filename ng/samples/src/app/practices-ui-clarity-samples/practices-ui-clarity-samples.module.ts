import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ClarityModule } from '@clr/angular';
import { DatagridModule, DatePickerInputModule, DialogModule } from '@nexplore/practices-ui-clarity';
import { TranslateModule } from '@ngx-translate/core';

import { DatagridViewComponent } from './datagrid/datagrid-view/datagrid-view.component';
import { DatagridWithFilterComponent } from './datagrid/datagrid-with-filter/datagrid-with-filter.component';
import { DatagridWithoutFilterComponent } from './datagrid/datagrid-without-filter/datagrid-without-filter.component';
import { DatePickerViewComponent } from './date-picker/date-picker-view.component';
import { DialogViewComponent } from './dialog/dialog-view/dialog-view.component';
import { PRACTICES_UI_CLARITY_SAMPLES_ROUTES } from './practices-ui-clarity-samples.routes';
import { SubnavigationComponent } from './subnavigation/subnavigation.component';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(PRACTICES_UI_CLARITY_SAMPLES_ROUTES),
        TranslateModule.forChild(),
        ClarityModule,
        FormsModule,
        ReactiveFormsModule,
        DatagridModule,
        DialogModule,
        DatePickerInputModule,
    ],
    declarations: [
        SubnavigationComponent,
        DatagridViewComponent,
        DatePickerViewComponent,
        DialogViewComponent,
        DatagridWithFilterComponent,
        DatagridWithoutFilterComponent,
    ],
})
export class PracticesUiClaritySamplesModule {}
