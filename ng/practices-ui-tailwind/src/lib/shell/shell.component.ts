import { NgClass } from '@angular/common';
import { Component, ElementRef, Input, ViewChild, inject } from '@angular/core';
import { NavigationEnd, Router, Routes } from '@angular/router';
import { PuiBreadcrumbComponent } from '../breadcrumb/breadcrumb.component';

import { DestroyService } from '@nexplore/practices-ui';
import { debounceTime, skip, takeUntil } from 'rxjs';
import { PuiContainerDirective } from '../common/container.directive';
import { PuiIconSpinnerComponent } from '../icons/icon-spinner.component';
import { PuiStickyDirective } from '../util/sticky.directive';
import { PuiShellService } from './shell.service';

export type AutofocusContentOnRouterNavigationConfig = {
    /**
     * If `true`, the first (initial) navigation event will be skipped.
     *
     * Default: `true`
     */
    skipFirst: boolean;

    /**
     * If `true`, the first focusable element will be focused.
     *
     * - First, it searches for elements with `autofocus` and `cdkFocusInitial` attributes.
     * - If none found, it looks for the `main` element or any form element or button.
     *
     * Default: `true`
     */
    focus: boolean;

    /**
     * If `true`, the to be focused element will be scrolled into view.
     *
     * The viewport will be scrolled to the top of the document, as long as the focused element will be inside the visible viewport.
     *
     * Default: `true`
     */
    scrollIntoView: boolean;
};

@Component({
    standalone: true,
    selector: 'pui-shell',
    templateUrl: './shell.component.html',
    imports: [PuiContainerDirective, NgClass, PuiBreadcrumbComponent, PuiIconSpinnerComponent, PuiStickyDirective],
    providers: [DestroyService],
})
export class PuiShellComponent {
    readonly shellService = inject(PuiShellService);
    private _router = inject(Router, { optional: true });

    @Input() hideBreadcrumbs = false;

    @Input()
    breadcrumbsRouterConfig: boolean | Routes = true;

    @Input()
    stickyBreadcrumbs = false;

    @Input()
    breadcrumbsAlwaysShowHome = false;

    @Input()
    loading = false;

    /**
     * Set `true` to automaticly focus the first element in the content, whenever a navigation occurs.
     *
     * Respects the attributes `autofocus` and `cdkFocusInitial`
     */
    @Input()
    autofocusContentOnRouterNavigation = false;

    /**
     * Only applies if `autofocusContentOnRouterNavigation` is set to `true`.
     * Configures the behavior of the autofocus.
     */
    @Input()
    autofocusContentOnRouterNavigationConfig: AutofocusContentOnRouterNavigationConfig = {
        skipFirst: true,
        focus: true,
        scrollIntoView: true,
    };

    @ViewChild('content') contentRef: ElementRef<HTMLElement> | null = null;

    constructor() {
        const destroy$ = inject(DestroyService);

        if (this._router) {
            const _routerEventsSub = this._router.events
                .pipe(
                    debounceTime(10),
                    skip(this.autofocusContentOnRouterNavigationConfig.skipFirst ? 1 : 0),
                    takeUntil(destroy$),
                )
                .subscribe((ev) => {
                    if (this.autofocusContentOnRouterNavigation && this.contentRef && ev instanceof NavigationEnd) {
                        const contentEl = this.contentRef.nativeElement;
                        const elementToFocus =
                            contentEl.querySelector<HTMLElement>('[autofocus], [cdkfocusinitial]') ??
                            contentEl.querySelector<HTMLElement>(
                                'main[tabindex], [tabindex]:not([tabindex^="-"]), a, button, input, textarea, select',
                            );

                        if (elementToFocus && this.autofocusContentOnRouterNavigationConfig.focus) {
                            elementToFocus.focus();
                        }

                        if (this.autofocusContentOnRouterNavigationConfig.scrollIntoView) {
                            if (!elementToFocus || this._isElementInsideViewportFromDocumentTop(elementToFocus)) {
                                document.body.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            } else {
                                elementToFocus.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                            }
                        }
                    }
                });
            // Intentionally not stored on the instance; lifecycle tied to destroy$.
        }
    }

    private _isElementInsideViewportFromDocumentTop(elementToFocus: HTMLElement) {
        return elementToFocus && elementToFocus.getBoundingClientRect().top + window.scrollY < window.innerHeight;
    }
}

