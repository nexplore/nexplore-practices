import { CommonModule, NgClass } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, HostBinding, HostListener, Input, Output, QueryList, Renderer2, ViewChild, ViewChildren, inject } from '@angular/core';
import { PuibeExpansionPanelComponent } from '../expansion-panel/expansion-panel.component';

@Component({
    standalone: true,
    selector: 'puibe-nav-expansion-panel',
    templateUrl: './nav-expansion-panel.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [PuibeExpansionPanelComponent, CommonModule, NgClass],
})
export class PuibeNavExpansionPanelComponent implements AfterViewInit {
    private readonly renderer = inject(Renderer2);
    private readonly cdr = inject(ChangeDetectorRef);

    @HostListener('window:resize', []) onWindowResize() {
        this.updateBar();
    }

    @HostBinding('class') className = 'block';

    @ViewChild(PuibeExpansionPanelComponent, { static: true }) expansionPanel: PuibeExpansionPanelComponent;

    @ViewChild('movingBar') movingBar: ElementRef<HTMLDivElement>;

    @ViewChildren('navHeading') navHeadings: QueryList<ElementRef<HTMLAnchorElement>>;

    @Input() navigationHeadings: string[];

    @Input() heading: string;

    @Output() headingClicked: EventEmitter<number> = new EventEmitter<number>();

    @Output() activeIndexChanged: EventEmitter<number> = new EventEmitter<number>();

    private _activeIndex: number;
    get activeIndex() {
        return this._activeIndex;
    }
    private set activeIndex(value: number) {
        this._activeIndex = value;
        this.cdr.detectChanges();
        this.updateBar();
        this.activeIndexChanged.emit(value);
    }

    ngAfterViewInit() {
        this.clearActive(); // Reset initially, so the bar has it's height and top set.
    }

    setActive(index: number) {
        if (index === this.activeIndex) {
            return;
        }

        this.activeIndex = index;
    }

    onHeadingClick(index: number, event: MouseEvent) {
        event.preventDefault();

        if (!this.headingClicked.observed) {
            this.setActive(index);
        }

        this.headingClicked.emit(index);
    }

    clearActive() {
        this.activeIndex = -1;
    }

    private updateBar() {
        let targetHeight = 0;
        let targetTop = 0;

        if (this.activeIndex > -1) {
            const headings = this.navHeadings.toArray();

            const targetHeading = headings[this.activeIndex];
            targetHeight = targetHeading?.nativeElement?.offsetHeight || 0;
            targetTop = targetHeading?.nativeElement?.offsetTop || 0;
        }

        this.renderer.setStyle(this.movingBar.nativeElement, 'height', `${targetHeight}px`);
        this.renderer.setStyle(this.movingBar.nativeElement, 'top', `${targetTop}px`);
    }
}
