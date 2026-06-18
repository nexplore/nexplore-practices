import { animate, AnimationTriggerMetadata, state, style, transition, trigger } from '@angular/animations';
import { CdkAccordionItem, CdkAccordionModule } from '@angular/cdk/accordion';
import { CommonModule } from '@angular/common';
import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    HostBinding,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    ViewChild,
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { PuibeIconArrowComponent } from '../icons/icon-arrow.component';
import { isElementVisibleInVerticalScrollView } from '../util/utils';

let nextUniqueId = 0;

const ANIMATION_DURATION_MS = 225;

const bodyExpansionAnimation: AnimationTriggerMetadata = trigger('bodyExpansion', [
    state(
        'collapsed',
        style({
            height: '0px',
            visibility: 'hidden',
            paddingTop: '0px',
            paddingBottom: '0px',
            overflow: 'hidden',
            display: 'none',
        })
    ),
    state('expanded', style({ height: '*', visibility: 'visible' })),
    transition('expanded <=> collapsed', [
        animate(`0ms`, style({ overflow: 'hidden' })),
        animate(`${ANIMATION_DURATION_MS}ms cubic-bezier(0.4,0.0,0.2,1)`),
        animate(`0ms`, style({ overflow: 'hidden' })),
    ]),
]);

@Component({
    standalone: true,
    selector: 'puibe-expansion-panel',
    templateUrl: './expansion-panel.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [CdkAccordionModule, PuibeIconArrowComponent, CommonModule, TranslateModule],
    animations: [bodyExpansionAnimation],
})
export class PuibeExpansionPanelComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
    @HostBinding('class')
    className = 'block';

    @ViewChild(CdkAccordionItem, { static: true })
    accordionItem: CdkAccordionItem;

    @ViewChild('content', { static: true })
    contentRef: ElementRef<HTMLElement>;

    @ViewChild('headingText')
    headingText?: ElementRef<HTMLElement>;

    @ViewChild('headingAfterWrapper')
    headingAfterWrapper?: ElementRef<HTMLElement>;

    @ViewChild('headingAfterInlineHost')
    headingAfterInlineHost?: ElementRef<HTMLElement>;

    @ViewChild('headingAfterActionHost')
    headingAfterActionHost?: ElementRef<HTMLElement>;

    private _id: string = (nextUniqueId++).toString();
    @Input()
    set id(value: string) {
        this._id = value;
    }
    get id() {
        return this._id;
    }

    @Input() heading: string;

    @Input() headingLevel = '2';

    @Input() caption: string;

    @Input()
    set isExpanded(value: boolean) {
        if (this.isInitiallyCollapsed !== undefined) {
            this.isInitiallyCollapsed = false;
        }
        this.accordionItem.expanded = value;
    }
    get isExpanded(): boolean {
        return this.accordionItem.expanded;
    }

    @Input()
    variant: 'sand' | 'white' | 'red' | 'light-sand' = 'sand';

    @Input()
    addItemPadding = true;

    @Input()
    compact = false;

    /**
     * By default, when expanding a panel, it will automaticly scroll into view. Also, when toggling a already expanded panel which is only barely visible on the screen, it will scroll into view INSTEAD of collapsing.
     * Set to `true` to disable this behavior.
     */
    @Input()
    disableScrollIntoView = false;

    /**
     * If `true`, allows scrolling the panel content, when overflowing
     */
    @Input()
    enableContentScroll = false;

    /**
     * If `true`, truncates the heading text with ellipsis when it overflows.
     */
    @Input()
    truncateHeading = false;

    get isSand(): boolean {
        return this.variant === 'sand';
    }

    get isLightSand(): boolean {
        return this.variant === 'light-sand';
    }

    get isWhite(): boolean {
        return this.variant === 'white';
    }

    get isRed(): boolean {
        return this.variant === 'red';
    }

    // The idea of this property:
    // `isInitiallyCollapsed` is only true, if `isExpanded` is initially false. As soon `isExpanded` gets changed, `isInitiallyCollapsed` gets reset to false.
    isInitiallyCollapsed?: boolean = undefined;

    private resizeObserver?: ResizeObserver;

    constructor(private elRef: ElementRef<HTMLElement>, private cdr: ChangeDetectorRef) {}

    ngOnInit(): void {
        this.isInitiallyCollapsed = !this.isExpanded;
    }

    ngAfterViewInit(): void {
        this.resizeObserver = new ResizeObserver(() => this.updateHeadingAfterPosition());

        queueMicrotask(() => {
            if (this.headingText?.nativeElement) {
                this.resizeObserver?.observe(this.headingText.nativeElement);
            }

            this.resizeObserver?.observe(this.elRef.nativeElement);
            this.updateHeadingAfterPosition();
        });
    }

    ngOnChanges(): void {
        queueMicrotask(() => this.updateHeadingAfterPosition());
    }

    ngOnDestroy(): void {
        this.resizeObserver?.disconnect();
    }

    _getExpandedState(): 'expanded' | 'collapsed' {
        return this.accordionItem.expanded ? 'expanded' : 'collapsed';
    }

    toggle(accordionItem: CdkAccordionItem) {
        if (
            !this.disableScrollIntoView &&
            accordionItem.expanded &&
            !isElementVisibleInVerticalScrollView(this.contentRef.nativeElement, 50)
        ) {
            // Content is obstructed, instead of collapsing, keep expandend and scroll to content. Another click is required to collapse
            this.scrollIntoView();
        } else {
            accordionItem.toggle();

            if (!this.disableScrollIntoView && accordionItem.expanded) {
                this.scrollIntoView(ANIMATION_DURATION_MS + 1);
            }
        }

        this.isInitiallyCollapsed = false;
    }

    scrollIntoView(timeout = 1) {
        setTimeout(() => {
            this.elRef.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, timeout);
    }

    private updateHeadingAfterPosition(): void {
        const heading = this.headingText?.nativeElement;
        const wrapper = this.headingAfterWrapper?.nativeElement;
        const inlineHost = this.headingAfterInlineHost?.nativeElement;
        const actionHost = this.headingAfterActionHost?.nativeElement;

        if (!heading || !wrapper || !inlineHost || !actionHost) {
            return;
        }

        const lineHeight = parseFloat(getComputedStyle(heading).lineHeight);
        const isWrapped = heading.clientHeight > lineHeight * 1.5;
        const shouldMoveToActions = !this.truncateHeading && isWrapped;
        const target = shouldMoveToActions ? actionHost : inlineHost;

        if (wrapper.parentElement !== target) {
            target.appendChild(wrapper);
            this.cdr.markForCheck();
        }
    }
}
