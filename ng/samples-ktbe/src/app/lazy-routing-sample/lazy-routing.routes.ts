import { Routes } from '@angular/router';
import { LazyRoutingSampleComponent } from './lazy-routing.component';
import {
    Breadcrumb3Component,
    Breadcrumb2Component,
} from '../practices-ui-ktbe-samples/breadcrumb/breadcrumb.component';

export const LAZY_LOADING_SAMPLE_ROUTES: Routes = [
    { path: '', component: LazyRoutingSampleComponent },
    {
        path: 'sub1',
        title: 'Sub 1',
        data: { breadcrumb: { openSideNav: true } },
        children: [{ path: 'sub2', component: Breadcrumb3Component, title: 'Sub 2' }],
    },
    {
        path: 'sub1b',
        component: Breadcrumb2Component,
        title: 'Sub 1b',
        data: { breadcrumb: { openSideNav: true } },
        children: [
            {
                path: 'sub2b',
                component: Breadcrumb3Component,
                title: 'Sub 2b',
            },
        ],
    },
    {
        path: 'sub1c',
        component: Breadcrumb2Component,
        data: { excludeFromMenu: true },
        title: 'Sub 1c',
        children: [
            {
                path: 'sub2c',
                component: Breadcrumb3Component,
                title: 'Sub 2c',
            },
        ],
    },
];
