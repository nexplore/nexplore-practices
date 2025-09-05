import { Component, Input, TemplateRef } from '@angular/core';
import { NgComponentOutlet, NgIf, NgTemplateOutlet } from '@angular/common';
import { DialogContent } from './action-dialog.types';

@Component({
    selector: 'puibe-dialog-template-content',
    standalone: true,
    imports: [NgIf, NgComponentOutlet, NgTemplateOutlet],
    template: `
        <ng-container *ngIf="isContentString; else tmpl">{{ content }}</ng-container>
        <ng-template #tmpl>
            <ng-container *ngIf="isContentTemplate; else cmp">
                <ng-container *ngTemplateOutlet="content; context: { $implicit: contentInputs }"></ng-container>
            </ng-container>
        </ng-template>
        <ng-template #cmp>
            <ng-container *ngComponentOutlet="content; inputs: contentInputs"></ng-container>
        </ng-template>
    `,
})
export class DialogTemplateContentComponent {
    @Input()
    content: DialogContent;

    @Input()
    contentInputs: any;

    get isContentTemplate() {
        return this.content instanceof TemplateRef;
    }

    get isContentString() {
        return typeof this.content === 'string';
    }
}
