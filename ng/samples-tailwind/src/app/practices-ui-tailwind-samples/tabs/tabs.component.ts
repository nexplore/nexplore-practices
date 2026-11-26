import { AsyncPipe, JsonPipe } from '@angular/common';
import { Component } from '@angular/core';
import { PuiDetailPageDirective, PuiTabsComponent, PuiTabSelectionItem } from '@nexplore/practices-ui-tailwind';
import { BehaviorSubject } from 'rxjs';

@Component({
    standalone: true,
    selector: 'app-tabs',
    templateUrl: './tabs.component.html',
    imports: [PuiTabsComponent, JsonPipe, AsyncPipe, PuiDetailPageDirective],
})
export class TabsComponent {
    items: Array<PuiTabSelectionItem> = [
        { label: 'Lorem Ipsum', id: '1' },
        { label: 'Dolor sit amet', id: '2' },
        { label: 'consectetur adipiscing elit', id: '3' },
    ];

    selectedElement$ = new BehaviorSubject<PuiTabSelectionItem>(this.items[2]);

    onChange(id: string) {
        const found = this.items.find((element) => element.id === id);
        this.selectedElement$.next(found);
    }
}

