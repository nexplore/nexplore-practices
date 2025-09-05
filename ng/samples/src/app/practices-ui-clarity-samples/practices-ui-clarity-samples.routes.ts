import { Route } from '@angular/router';

import { DatagridViewComponent } from './datagrid/datagrid-view/datagrid-view.component';
import { DatePickerViewComponent } from './date-picker/date-picker-view.component';
import { DialogViewComponent } from './dialog/dialog-view/dialog-view.component';
import { SubnavigationComponent } from './subnavigation/subnavigation.component';

export const PRACTICES_UI_CLARITY_SAMPLES_ROUTES: Route[] = [
    {
        path: '',
        outlet: 'subnav',
        component: SubnavigationComponent,
    },
    {
        path: 'datagrid',
        component: DatagridViewComponent,
    },
    {
        path: 'datepicker',
        component: DatePickerViewComponent,
    },
    {
        path: 'dialog',
        component: DialogViewComponent,
    },
];
