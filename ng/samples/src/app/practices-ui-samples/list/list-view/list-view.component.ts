import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-list-view',
    templateUrl: './list-view.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class ListViewComponent {}
