import { ChangeDetectionStrategy, Component, ElementRef, Renderer2, ViewChild, inject } from '@angular/core';
import {
    PuiExpansionPanelComponent,
    PuiTeaserComponent,
    PuiTwoColumnNavComponent,
} from '@nexplore/practices-ui-tailwind';

@Component({
    standalone: true,
    selector: 'app-expansion-panels',
    templateUrl: './expansion-panels.component.html',
    imports: [PuiExpansionPanelComponent, PuiTwoColumnNavComponent, PuiTeaserComponent],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpansionPanelsComponent {
    private readonly renderer = inject(Renderer2);

    @ViewChild('twoColumnNavContent', { static: true }) twoColumnNavContent: ElementRef<HTMLDivElement>;

    public addSpacerBetweenHeadings() {
        const addClasses =
            (element: HTMLElement) =>
            (...classes: string[]) => {
                classes.forEach((c) => this.renderer.addClass(element, c));
            };

        Array.from(this.twoColumnNavContent.nativeElement.children).forEach((child) => {
            if (child.tagName === 'DIV') {
                const spacer = this.renderer.createElement('span');
                addClasses(spacer)('bg-light-gray', 'block', 'font-light', 'p-10', 'my-1');
                this.renderer.setProperty(spacer, 'innerText', 'Spacer');
                this.renderer.insertBefore(this.twoColumnNavContent.nativeElement, spacer, child);
            }
        });
    }

    public removeSpacersBetweenHeadings() {
        Array.from(this.twoColumnNavContent.nativeElement.children)
            .filter((child) => child.tagName === 'SPAN')
            .forEach((spacer) => {
                this.twoColumnNavContent.nativeElement.removeChild(spacer);
            });
    }
}

