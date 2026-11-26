
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TitleService } from '@nexplore/practices-ui';
import { PuiBreadcrumbComponent } from '@nexplore/practices-ui-tailwind';

@Component({
    standalone: true,
    selector: 'app-breadcrumb',
    templateUrl: './breadcrumb.component.html',
    imports: [PuiBreadcrumbComponent, RouterModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BreadcrumbComponent {
    canOpenSubRoute = true;

    constructor() {
        const router = inject(Router);
        const titleService = inject(TitleService);

        if (router.routerState.snapshot.root.queryParams.someId) {
            setTimeout(() => {
                // TODO: This setTimeout is required because `TitleService.updateTitle` would otherwise override the custom title
                titleService.setTitle(
                    `Overridden (with query param = ${router.routerState.snapshot.root.queryParams.someId})`,
                );
            });
        }
    }
}

@Component({
    standalone: true,
    selector: 'app-breadcrumb2',
    templateUrl: './breadcrumb.component.html',
    imports: [PuiBreadcrumbComponent, RouterModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Breadcrumb2Component {
    canOpenSubRoute = false;
}

@Component({
    standalone: true,
    selector: 'app-breadcrumb3',
    templateUrl: './breadcrumb.component.html',
    imports: [PuiBreadcrumbComponent, RouterModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Breadcrumb3Component {
    canOpenSubRoute = false;
}

