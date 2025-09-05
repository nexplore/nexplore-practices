import { Route } from '@angular/router';

export const APP_ROUTES: Route[] = [
    {
        path: 'practices-ui-samples',
        loadChildren: () =>
            import('./practices-ui-samples/practices-ui-samples.module').then((m) => m.PracticesUiSamplesModule),
    },
    {
        path: 'practices-ui-clarity-samples',
        loadChildren: () =>
            import('./practices-ui-clarity-samples/practices-ui-clarity-samples.module').then(
                (m) => m.PracticesUiClaritySamplesModule
            ),
    },
];
