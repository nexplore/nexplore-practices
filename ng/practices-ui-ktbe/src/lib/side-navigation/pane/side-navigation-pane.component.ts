import { AnimationTriggerMetadata, trigger, style, transition, animate } from '@angular/animations';
import { NgClass, NgIf } from '@angular/common';
import { Component, Input, Output, EventEmitter, ElementRef, ViewChild } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { PuibeIconArrowComponent } from '../../icons/icon-arrow.component';
import { PuibeIconCloseComponent } from '../../icons/icon-close.component';
import { PuibeIconHomeComponent } from '../../icons/icon-home.component';
import { PuibeSideNavigationItemComponent } from '../item/side-navigation-item.component';
import { A11yModule } from '@angular/cdk/a11y';

export const panelExpansionAnimation: AnimationTriggerMetadata = trigger('sidePanelAnim', [
    transition(':enter', [
        style({ width: '0px', minWidth: '0px', overflow: 'hidden' }),
        animate('225ms cubic-bezier(0.4,0.0,0.2,1)', style({ width: '*', minWidth: '*', overflow: 'hidden' })),
    ]),

    transition(':leave', [
        style({ width: '*', overflow: 'hidden' }),
        animate('225ms cubic-bezier(0.4,0.0,0.2,1)', style({ width: '0', minWidth: '0', overflow: 'hidden' })),
    ]),
]);

@Component({
    standalone: true,
    selector: 'puibe-side-navigation-pane',
    templateUrl: './side-navigation-pane.component.html',
    imports: [
        NgClass,
        TranslateModule,
        NgClass,
        NgIf,
        TranslateModule,
        PuibeIconHomeComponent,
        PuibeIconCloseComponent,
        PuibeIconArrowComponent,
        PuibeSideNavigationItemComponent,
        A11yModule,
    ],
    animations: [panelExpansionAnimation],
})
export class PuibeSideNavigationPaneComponent {
    @Input() heading: string;

    @Input() open: boolean;
    @Output() openChange = new EventEmitter<boolean>();

    @Output() backClick = new EventEmitter<void>();

    @Input() canClose: boolean;

    @Input() canGoBack: boolean;

    @Input() noHeader: boolean;

    @ViewChild('contentRef') contentRef: ElementRef<HTMLDivElement>;

    /** @internal For debugging and diagnostics only (Angular Dev tools)  */
    @Input()
    data: any;

    constructor(private elementRef: ElementRef<HTMLElement>) {}

    close() {
        this.openChange.emit(false);
    }

    back() {
        this.backClick.emit();
    }

    scrollIntoView() {
        this.elementRef.nativeElement.scrollIntoView({ behavior: 'smooth' });
    }

    focusFirstItem(selector?: string) {
        this.contentRef?.nativeElement
            .querySelector<HTMLElement>(`${selector ?? 'puibe-side-navigation-item'} > [data-nav-btn]`)
            ?.focus();
    }

    onClickFooter(event: PointerEvent) {
        const target = event.target as HTMLElement;
        // If a link was clicked, close the nav pane
        if (target.matches('a, button, [routerLink]')) {
            this.openChange.emit(false);
        }
    }
}
