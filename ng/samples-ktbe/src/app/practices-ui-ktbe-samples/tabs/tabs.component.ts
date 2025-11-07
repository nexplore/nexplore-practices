import { AsyncPipe, JsonPipe } from '@angular/common';
import { Component } from '@angular/core';
import { PuibeDetailPageDirective, PuibeTabsComponent, PuibeTabSelectionItem } from '@nexplore/practices-ui-ktbe';
import { BehaviorSubject } from 'rxjs';

@Component({
    standalone: true,
    selector: 'app-tabs',
    templateUrl: './tabs.component.html',
    imports: [PuibeTabsComponent, JsonPipe, AsyncPipe, PuibeDetailPageDirective],
})
export class TabsComponent {
    items: Array<PuibeTabSelectionItem> = [
        { label: 'Lorem Ipsum', id: '1' },
        { label: 'Dolor sit amet', id: '2' },
        { label: 'consectetur adipiscing elit', id: '3' },
    ];

    selectedElement$ = new BehaviorSubject<PuibeTabSelectionItem>(this.items[2]);

    onChange(id: string) {
        const found = this.items.find((element) => element.id === id);
        this.selectedElement$.next(found);
    }
}
