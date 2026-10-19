import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { PuibeButtonDirective, PuibeSideOverlayPanelService } from '@nexplore/practices-ui-ktbe';

@Component({
    selector: 'app-side-overlay-panel',
    standalone: true,
    imports: [PuibeButtonDirective],
    changeDetection: ChangeDetectionStrategy.Eager,
    templateUrl: './side-overlay-panel.component.html',
})
export class AppSideOverlayPanelComponent {
    private readonly _sideOverlayPanelService = inject(PuibeSideOverlayPanelService);

    protected closePanel(): void {
        this._sideOverlayPanelService.closeOpenPanel();
    }
}
