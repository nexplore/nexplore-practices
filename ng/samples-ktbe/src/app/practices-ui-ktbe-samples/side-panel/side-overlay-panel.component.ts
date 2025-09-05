import { Component, inject } from '@angular/core';
import { PuibeButtonDirective, PuibeSideOverlayPanelService } from '@nexplore/practices-ui-ktbe';

@Component({
    selector: 'app-side-overlay-panel',
    standalone: true,
    imports: [PuibeButtonDirective],
    templateUrl: './side-overlay-panel.component.html',
})
export class AppSideOverlayPanelComponent {
    private readonly _sideOverlayPanelService = inject(PuibeSideOverlayPanelService);

    protected closePanel(): void {
        this._sideOverlayPanelService.closeOpenPanel();
    }
}
