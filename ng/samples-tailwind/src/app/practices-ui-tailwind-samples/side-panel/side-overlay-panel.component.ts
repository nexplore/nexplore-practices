import { Component, inject } from '@angular/core';
import { PuiButtonDirective, PuiSideOverlayPanelService } from '@nexplore/practices-ui-tailwind';

@Component({
    selector: 'app-side-overlay-panel',
    standalone: true,
    imports: [PuiButtonDirective],
    templateUrl: './side-overlay-panel.component.html',
})
export class AppSideOverlayPanelComponent {
    private readonly _sideOverlayPanelService = inject(PuiSideOverlayPanelService);

    protected closePanel(): void {
        this._sideOverlayPanelService.closeOpenPanel();
    }
}

