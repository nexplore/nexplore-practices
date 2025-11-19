import { CdkMenuModule, CdkMenuTrigger } from '@angular/cdk/menu';
import { NgIf, NgTemplateOutlet } from '@angular/common';
import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    HostBinding,
    Input,
    TemplateRef,
    ViewChild,
    ViewContainerRef,
} from '@angular/core';
import { DestroyService } from '@nexplore/practices-ui';
import { startWith, takeUntil } from 'rxjs';
import { PuibeIconOptionsComponent } from '../../icons/icon-options.component';

@Component({
    standalone: true,
    selector: 'puibe-table-col-actions',
    templateUrl: 'table-col-actions.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [NgIf, NgTemplateOutlet, PuibeIconOptionsComponent, CdkMenuModule],
})
export class PuibeTableColActionsComponent implements AfterViewInit {
    @HostBinding('class')
    className = 'flex gap-1';

    @Input()
    showOptionsMenu = false;

    @ViewChild(CdkMenuTrigger) cdkMenuTriggerFor: CdkMenuTrigger;
    @ViewChild('contentTemplate') contentTemplate: TemplateRef<unknown>;
    @ViewChild('menuItemsSlot', { read: ViewContainerRef }) menuItemsSlot: ViewContainerRef;

    constructor(private readonly _destroyService: DestroyService) {}

    ngAfterViewInit(): void {
        if (this.showOptionsMenu) {
            /* if the menu is closed the template ref has to be inserted in a hidden field for the rowAction to work properly */
            this.cdkMenuTriggerFor.closed.pipe(startWith(true), takeUntil(this._destroyService)).subscribe(() => {
                this.menuItemsSlot.insert(this.contentTemplate.createEmbeddedView({}));
            });
        }
    }
}
