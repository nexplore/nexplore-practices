import { animate, AnimationTriggerMetadata, state, style, transition, trigger } from '@angular/animations';
import { CdkAccordionItem, CdkAccordionModule } from '@angular/cdk/accordion';
import { CommonModule } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    HostBinding,
    inject,
    Input,
    OnInit,
    ViewChild,
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { PuiIconArrowComponent } from '../icons/icon-arrow.component';
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
        }),
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
    selector: 'pui-expansion-panel',
    templateUrl: './expansion-panel.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [CdkAccordionModule, PuiIconArrowComponent, CommonModule, TranslateModule],
    animations: [bodyExpansionAnimation],
})
export class PuiExpansionPanelComponent implements OnInit {
    private elRef = inject<ElementRef<HTMLElement>>(ElementRef);

    @HostBinding('class')
    className = 'block';

    @ViewChild(CdkAccordionItem, { static: true })
    accordionItem!: CdkAccordionItem;

    @ViewChild('content', { static: true })
    contentRef!: ElementRef<HTMLElement>;

    private _id: string = (nextUniqueId++).toString();
    @Input()
    set id(value: string) {
        this._id = value;
    }
    get id() {
        return this._id;
    }

    @Input() heading = '';

    @Input() headingLevel = '2';

    @Input() caption = '';

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
    variant: 'highlight' | 'white' | 'brand' | 'red' | 'very-light-secondary' = 'highlight';

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

    get isHighlight(): boolean {
        return this.variant === 'highlight';
    }

    get isLightHighlight(): boolean {
        return this.variant === 'very-light-secondary';
    }

    get isWhite(): boolean {
        return this.variant === 'white';
    }

    get isRed(): boolean {
        return this.variant === 'red';
    }

    get isBrand(): boolean {
        return this.variant === 'brand';
    }

    // The idea of this property:
    // `isInitiallyCollapsed` is only true, if `isExpanded` is initially false. As soon `isExpanded` gets changed, `isInitiallyCollapsed` gets reset to false.
    isInitiallyCollapsed?: boolean = undefined;

    ngOnInit(): void {
        this.isInitiallyCollapsed = !this.isExpanded;
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
}

