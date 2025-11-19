/*
 * Copyright (c) 2016-2023 VMware, Inc. All Rights Reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of https://github.com/vmware-clarity/ng-clarity.
 */

import { NgFor } from '@angular/common';
import { Component, ElementRef, Input, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DEFAULT_PAGE_SIZE_OPTIONS } from './config';

import { PageService } from './page.service';
import { A11yModule } from '@angular/cdk/a11y';

let nextUniqueId = 0;

@Component({
    standalone: true,
    selector: 'puibe-table-page-size',
    templateUrl: './table-page-size.component.html',
    imports: [FormsModule, NgFor, A11yModule],
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

    getLabel() {
        return this._elementRef.nativeElement.innerText;
    }
}
