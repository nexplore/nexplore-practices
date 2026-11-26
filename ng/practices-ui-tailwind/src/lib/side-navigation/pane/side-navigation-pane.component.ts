import { animate, AnimationTriggerMetadata, style, transition, trigger } from '@angular/animations';
import { A11yModule } from '@angular/cdk/a11y';
import { Component, ElementRef, EventEmitter, inject, Input, Output, ViewChild } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { PuiIconArrowComponent } from '../../icons/icon-arrow.component';
import { PuiIconCloseComponent } from '../../icons/icon-close.component';

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
    selector: 'pui-side-navigation-pane',
    templateUrl: './side-navigation-pane.component.html',
    imports: [TranslateModule, PuiIconCloseComponent, PuiIconArrowComponent, A11yModule],
    animations: [panelExpansionAnimation],
})
export class PuiSideNavigationPaneComponent {
    private elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

    @Input() heading = '';
    @Input() open = false;
    @Output() openChange = new EventEmitter<boolean>();

    @Output() backClick = new EventEmitter<void>();

    @Input() canClose = false;
    @Input() canGoBack = false;
    @Input() noHeader = false;

    @ViewChild('contentRef') contentRef?: ElementRef<HTMLDivElement>;

    /** @internal For debugging and diagnostics only (Angular Dev tools) */
    @Input() data: unknown;

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
            .querySelector<HTMLElement>(`${selector ?? 'pui-side-navigation-item'} > [data-nav-btn]`)
            ?.focus();
    }

    onClickFooter(event: PointerEvent) {
        const target = event.target as HTMLElement;
        if (target.matches('a, button, [routerLink]')) {
            this.openChange.emit(false);
        }
    }
}

