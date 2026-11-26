import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    HostBinding,
    HostListener,
    Input,
    ViewChild,
} from '@angular/core';
import { PuiTwoColumnLayoutComponent } from '../common/two-column-container.component';
import { PuiNavExpansionPanelComponent } from '../nav-expansion-panel/nav-expansion-panel.component';

type HeadingTagNames = keyof Pick<HTMLElementTagNameMap, 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'>;
type HeadingSelector = `${HeadingTagNames}#${string}` | `${HeadingTagNames}[id]`;

@Component({
    standalone: true,
    selector: 'pui-two-column-nav',
    templateUrl: './two-column-nav.component.html',
    imports: [PuiTwoColumnLayoutComponent, PuiNavExpansionPanelComponent],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PuiTwoColumnNavComponent implements AfterViewInit {
    @HostListener('window:scroll', []) onWindowScroll() {
        if (this.updateActiveOnScroll) {
            const verticalOffset = window.pageYOffset || document.documentElement.scrollTop || 0;
            const headingIndex = this.getHeadingIndexFromVerticalOffset(verticalOffset);
            this.navExpansionPanel.setActive(headingIndex);
        }
    }

    @HostBinding('class') className = 'block';

    @Input() heading: string;

    /**
     * An array of heading + id selectors (specific headings using '#' or all headings with ids using '[id]').
     * These selectors are used to query the heading elements from the left-column in the DOM.
     * The `innerText` value of these elements will populate the nav expansion panel and their `id`
     * will function as the respective scroll targets and will be set as the url hash
     *
     * @example
     * ```html
     * <pui-two-column-nav [headingSelectors]="['h2#heading-1', 'h2#heading-2', 'h3[id]']">
     *   <div left-column>
     *     <h2 id="heading-1">Heading 1</h2>
     *     <h2 id="heading-2">Heading 2</h2>
     *     <h3>Heading without id (Will be ignored)</h2>
     *     <h3 id="my-id-value-does-not-matter">Heading with some Id</h2>
     *   </div>
     * </pui-two-column-nav>
     * ```
     *
     * @remark Since the ids of the heading elements will be appended to the current url hash,
     * they must be slugified.
     */
    @Input() headingSelectors: HeadingSelector[] = ['h1[id]', 'h2[id]', 'h3[id]', 'h4[id]', 'h5[id]', 'h6[id]'];

    @ViewChild(PuiNavExpansionPanelComponent, { static: true }) navExpansionPanel: PuiNavExpansionPanelComponent;

    @ViewChild(PuiTwoColumnLayoutComponent, { static: true }) twoColumnLayout: PuiTwoColumnLayoutComponent;

    private headingElements: HTMLHeadingElement[];

    private inhibitScroll: ReturnType<typeof setTimeout>;

    private updateActiveOnScroll = true;

    scrollIntoView(index: number) {
        this.loadHeadingElements(); // Update references to heading elements in case they have changed

        if (index >= 0 && index < this.headingElements.length) {
            this.updateActiveOnScroll = false;
            this.navExpansionPanel.setActive(index);
            this.headingElements[index].scrollIntoView({ behavior: 'smooth' });

            clearTimeout(this.inhibitScroll);
            this.inhibitScroll = setTimeout(() => {
                this.updateActiveOnScroll = true;
            }, 600);
        }
    }

    updateLocationHash(index: number) {
        const url = new URL(window.location.href);
        url.hash = index >= 0 && index < this.headingElements.length ? this.headingElements[index].id : '';
        window.history.replaceState(null, null, url);
    }

    ngAfterViewInit() {
        this.loadHeadingElements();

        this.navExpansionPanel.navigationHeadings = this.headingElements.map((h) => h.innerText);
        this.navExpansionPanel.expansionPanel.isExpanded = true;
        this.navExpansionPanel.clearActive();
    }

    private loadHeadingElements() {
        this.headingElements = Array.from(
            this.twoColumnLayout.leftColumnContent.nativeElement.querySelectorAll(this.headingSelectors.join(',')),
        ) as HTMLHeadingElement[];
    }

    private getHeadingIndexFromVerticalOffset(verticalOffset: number) {
        for (let i = this.headingElements.length - 1; i >= 0; i--) {
            if (verticalOffset >= this.headingElements[i].offsetTop) {
                return i;
            }
        }

        return -1;
    }
}

