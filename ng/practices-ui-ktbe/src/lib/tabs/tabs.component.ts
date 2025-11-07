import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, OnInit, Output, Renderer2, ViewChild, ViewEncapsulation, inject } from '@angular/core';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';

import { PuibeIconArrowComponent } from '../icons/icon-arrow.component';

export interface PuibeTabSelectionItem {
    id: string;
    label: string;
}

@Component({
    standalone: true,
    selector: 'puibe-tabs',
    templateUrl: './tabs.component.html',
    styleUrls: ['./tabs.component.css', '../select/select.directive.css'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [NgClass, NgSelectModule, FormsModule, PuibeIconArrowComponent],
})
export class PuibeTabsComponent implements OnInit {
    private renderer = inject(Renderer2);

    activeClassNames = 'bg-anthrazit text-white';

    @Input()
    items: PuibeTabSelectionItem[];

    @Input()
    selectedItemId: string;

    @Input()
    ariaLabel = '';

    @Input() showBorder = true;

    @Output()
    selectedItemChange = new EventEmitter<string>();

    @ViewChild('arrow') ArrowIcon: ElementRef<HTMLDivElement>;

    ngOnInit() {
        if (!this.selectedItemId && this.items.length > 0) {
            this.onChange(this.items[0].id);
        }
    }

    onOpen() {
        this.renderer.removeClass(this.ArrowIcon.nativeElement, 'rotate-0');
        this.renderer.addClass(this.ArrowIcon.nativeElement, 'rotate-180');
    }

    onClose() {
        this.renderer.removeClass(this.ArrowIcon.nativeElement, 'rotate-180');
        this.renderer.addClass(this.ArrowIcon.nativeElement, 'rotate-0');
    }

    onChange(selectedItemId) {
        this.selectedItemId = selectedItemId;
        if (this.selectedItemChange) {
            this.selectedItemChange.emit(selectedItemId);
        }
    }
}
