import { NgClass } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnInit,
    Output,
    Renderer2,
    ViewChild,
    ViewEncapsulation,
    inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';

import { PuiIconArrowComponent } from '../icons/icon-arrow.component';

export interface PuiTabSelectionItem {
    id: string;
    label: string;
}

@Component({
    standalone: true,
    selector: 'pui-tabs',
    templateUrl: './tabs.component.html',
    styleUrls: ['./tabs.component.css', '../select/select.directive.css'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [NgClass, NgSelectModule, FormsModule, PuiIconArrowComponent],
})
export class PuiTabsComponent implements OnInit {
    private renderer = inject(Renderer2);

    activeClassNames = 'bg-bgdark text-white';

    @Input()
    items: PuiTabSelectionItem[] = [];

    @Input()
    selectedItemId = '';

    @Input()
    ariaLabel = '';

    @Input() showBorder = true;

    @Output()
    selectedItemChange = new EventEmitter<string>();

    @ViewChild('arrow') ArrowIcon?: ElementRef<HTMLDivElement>;

    ngOnInit() {
        if (!this.selectedItemId && this.items.length > 0) {
            this.onChange(this.items[0].id);
        }
    }

    onOpen() {
        if (!this.ArrowIcon) return;
        this.renderer.removeClass(this.ArrowIcon.nativeElement, 'rotate-0');
        this.renderer.addClass(this.ArrowIcon.nativeElement, 'rotate-180');
    }

    onClose() {
        if (!this.ArrowIcon) return;
        this.renderer.removeClass(this.ArrowIcon.nativeElement, 'rotate-180');
        this.renderer.addClass(this.ArrowIcon.nativeElement, 'rotate-0');
    }

    onChange(selectedItemId: string) {
        this.selectedItemId = selectedItemId;
        if (this.selectedItemChange) {
            this.selectedItemChange.emit(selectedItemId);
        }
    }
}

