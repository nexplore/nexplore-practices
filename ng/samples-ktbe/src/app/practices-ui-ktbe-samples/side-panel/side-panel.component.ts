import { Component, inject } from '@angular/core';
import {
    PuibeButtonDirective,
    PuibeSideOverlayPanelService,
    SIDE_OVERLAY_PANEL_PROVIDERS,
} from '@nexplore/practices-ui-ktbe';
import { AppSideOverlayPanelComponent } from './side-overlay-panel.component';

@Component({
    standalone: true,
    selector: 'app-side-panel',
    templateUrl: './side-panel.component.html',
    imports: [PuibeButtonDirective],
    providers: [...SIDE_OVERLAY_PANEL_PROVIDERS],
})
export class SidePanelExampleComponent {
    private readonly _sideOverlayPanelService = inject(PuibeSideOverlayPanelService);

    protected openSideOverlayPanel(): void {
        // TODO FUTURE IMPROVEMENT: remove service and use template.
        this._sideOverlayPanelService.open({
            title: 'The secret drawer',
            content: AppSideOverlayPanelComponent,
        });
    }
}
