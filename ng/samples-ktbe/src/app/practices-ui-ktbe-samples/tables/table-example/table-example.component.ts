import { DialogModule } from '@angular/cdk/dialog';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { formGroup } from '@nexplore/practices-ng-forms';
import { tableViewSource } from '@nexplore/practices-ng-list-view-source';
import { DestroyService } from '@nexplore/practices-ui';
import {
    MODAL_PROVIDERS,
    PracticesKtbeDefaultModule,
    PracticesKtbeFormComponentsModule,
    PracticesKtbeTableComponentsModule,
    PuibeIconEnumerationComponent,
    PuibeModalService,
    PuibeSelectDirective,
} from '@nexplore/practices-ui-ktbe';
import { NgSelectModule } from '@ng-select/ng-select';
import { tableSampleLoadFn } from '../tables.component';
import { AppTableDetailModalComponent } from './detail-modal.component';

export enum SampleType {
    Type1 = 'type1',
    Type2 = 'type2',
    Type3 = 'type3',
}

export interface SampleListEntry {
    id: string;
    type: SampleType;
    name: string;
    active: boolean;
}

interface SampleListFilter {
    name?: string | null;
    active?: boolean | null;
    type?: string | null;
}

@Component({
    selector: 'puibe-table-example',
    standalone: true,
    imports: [
        CommonModule,
        PracticesKtbeDefaultModule,
        NgSelectModule,
        PracticesKtbeFormComponentsModule,
        PracticesKtbeTableComponentsModule,
        PuibeSelectDirective,
        PuibeIconEnumerationComponent,
        DialogModule,
    ],
    templateUrl: './table-example.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [DestroyService, ...MODAL_PROVIDERS],
})
export class TableExampleComponent {
    private readonly _modalService = inject(PuibeModalService);

    protected readonly form = formGroup.withType<SampleListFilter>().withConfig({
        name: { nullable: true },
        active: { nullable: true },
        type: { nullable: true },
    });

    protected readonly activeOnlyFilterItems = [
        { label: 'All', value: null },
        { label: 'Active', value: true },
        { label: 'Inactive', value: false },
    ];
    protected readonly sampleTypes = [SampleType.Type1, SampleType.Type2, SampleType.Type3];
    protected readonly sampleTypeFilterItems = [
        { label: 'All types', value: null },

        { label: 'Type 1', value: SampleType.Type1 },
        { label: 'Type 2', value: SampleType.Type2 },
        { label: 'Type 3', value: SampleType.Type3 },
    ];
    protected readonly itemSource = tableViewSource.withType<SampleListEntry>().withFilterForm({
        columns: ['type', 'name', 'active'],
        loadFn: (params) =>
            tableSampleLoadFn<SampleListEntry>(params, 250, (i) => ({
                id: i.toString(),
                type: this.sampleTypes[Math.floor(Math.random() * this.sampleTypes.length)],
                name: 'Item ' + i,
                active: Math.random() > 0.3,
            })),
        filterForm: this.form,
        orderBy: 'name',
    });

    protected openModal(item: SampleListEntry): void {
        this._modalService.open(AppTableDetailModalComponent, {
            data: item,
        });
    }
}
