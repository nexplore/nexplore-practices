import { Component, Input, TemplateRef, ChangeDetectionStrategy } from '@angular/core';
import { NgComponentOutlet, NgTemplateOutlet } from '@angular/common';
import { DialogContent } from './action-dialog.types';

@Component({
    selector: 'puibe-dialog-template-content',
    standalone: true,
    imports: [NgComponentOutlet, NgTemplateOutlet],
    changeDetection: ChangeDetectionStrategy.Eager,
    template: `
        @if (isContentString) {
            {{ content }}
        } @else if (isContentTemplate) {
            <ng-container *ngTemplateOutlet="content; context: { $implicit: contentInputs }"></ng-container>
        } @else {
            <ng-container *ngComponentOutlet="content; inputs: contentInputs"></ng-container>
        }
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
