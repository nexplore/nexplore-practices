/*
 * Copyright (c) 2016-2023 VMware, Inc. All Rights Reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of https://github.com/vmware-clarity/ng-clarity.
 */

import { Component, ElementRef, Input, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DEFAULT_PAGE_SIZE_OPTIONS } from './config';

import { PageService } from './page.service';
import { A11yModule } from '@angular/cdk/a11y';

let nextUniqueId = 0;

@Component({
    standalone: true,
    selector: 'puibe-table-page-size',
    templateUrl: './table-page-size.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [FormsModule, A11yModule],
})
export class PuibeTablePageSizeComponent implements OnInit {
    readonly page = inject(PageService);
    private readonly _elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

    @Input() pageSizeOptions: number[] = DEFAULT_PAGE_SIZE_OPTIONS;
    @Input() pageSizeOptionsId = 'puibe-table-page-size-' + nextUniqueId++;

    ngOnInit() {
        if (!this.pageSizeOptions || this.pageSizeOptions.length === 0) {
            this.pageSizeOptions = [this.page.size];
        }
    }

    /** The projected content labels the select. Reading the DOM text in a binding would also contain the options. */
    protected get labelId() {
        return this.pageSizeOptionsId + '-label';
    }

    /** @deprecated The projected content is referenced with `aria-labelledby`, this method is no longer used. */
    getLabel() {
        // Only the projected label, not the texts of the options.
        const label = Array.from(this._elementRef.nativeElement.children).find((child) => child.id === this.labelId);
        return (label as HTMLElement | undefined)?.innerText ?? '';
    }
}
