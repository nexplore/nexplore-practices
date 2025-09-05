import { Route } from '@angular/router';

import { ListViewComponent } from './list/list-view/list-view.component';
import { StatusViewComponent } from './status/status-view/status-view.component';
import { SubnavigationComponent } from './subnavigation/subnavigation.component';

export const PRACTICES_UI_SAMPLES_ROUTES: Route[] = [
    {
        path: '',
        outlet: 'subnav',
        component: SubnavigationComponent,
    },
    { path: 'list', component: ListViewComponent },
    { path: 'status', component: StatusViewComponent },
];
