import { Component, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import * as commands from '@nexplore/practices-ng-commands';
import * as commonUtil from '@nexplore/practices-ng-common-util';
import * as dirtyGuard from '@nexplore/practices-ng-dirty-guard';
import * as forms from '@nexplore/practices-ng-forms';
import * as listViewSource from '@nexplore/practices-ng-list-view-source';
import * as logging from '@nexplore/practices-ng-logging';
import * as signals from '@nexplore/practices-ng-signals';
import * as status from '@nexplore/practices-ng-status';
import * as ui from '@nexplore/practices-ui';
import * as clr from '@nexplore/practices-ui-clarity';
import * as ktbe from '@nexplore/practices-ui-ktbe';
import { NgSelectModule } from '@ng-select/ng-select';

// Keep every export reachable, so the Angular 21 linker has to process all partial declarations of the libraries.
(globalThis as Record<string, unknown>)['practicesExports'] = [
    commands,
    commonUtil,
    dirtyGuard,
    forms,
    listViewSource,
    logging,
    signals,
    status,
    ui,
    clr,
    ktbe,
];

// Uses a few components in a template, so strictTemplates type-checks them against the Angular 21 compiler.
@Component({
    selector: 'app-root',
    imports: [
        ReactiveFormsModule,
        NgSelectModule,
        ktbe.PuibeShellComponent,
        ktbe.PuibeHeaderComponent,
        ktbe.PuibeFooterComponent,
        ktbe.PuibeBreadcrumbComponent,
        ktbe.PuibeBreadcrumbItemComponent,
        ktbe.PuibePanelComponent,
        ktbe.PuibeExpansionPanelComponent,
        ktbe.PuibeFormFieldComponent,
        ktbe.PuibeSelectDirective,
        ktbe.PuibeCheckboxComponent,
        ktbe.PuibeTimelineComponent,
        ktbe.PuibeTimelineItemComponent,
        clr.DatePickerInputComponent,
    ],
    template: `
        <puibe-shell>
            <puibe-header />
            <puibe-breadcrumb><puibe-breadcrumb-item>Home</puibe-breadcrumb-item></puibe-breadcrumb>
            <puibe-panel>
                <form [formGroup]="form">
                    <puibe-form-field>
                        <ng-select puibeInput formControlName="selection" [items]="items" />
                    </puibe-form-field>
                    <puibe-checkbox><input type="checkbox" formControlName="checked" /></puibe-checkbox>
                </form>
            </puibe-panel>
            <puibe-expansion-panel>{{ title() }}</puibe-expansion-panel>
            <puibe-timeline><puibe-timeline-item>Item</puibe-timeline-item></puibe-timeline>
            <puibe-footer />
        </puibe-shell>
    `,
})
export class App {
    protected readonly title = signal('Practices on Angular 21');
    protected readonly items = ['a', 'b'];
    protected readonly form = new FormGroup({
        selection: new FormControl<string | null>(null),
        checked: new FormControl(false),
    });
}
