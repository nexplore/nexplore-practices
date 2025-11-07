import { NgComponentOutlet, NgTemplateOutlet } from '@angular/common';
import { Component, Input, TemplateRef } from '@angular/core';
import { DialogContent } from './action-dialog.types';

@Component({
    selector: 'pui-dialog-template-content',
    standalone: true,
    imports: [NgComponentOutlet, NgTemplateOutlet],
    template: `
        @if (isContentString) {
            {{ content }}
        } @else {
            @if (isContentTemplate) {
                <ng-container *ngTemplateOutlet="content; context: { $implicit: contentInputs }"></ng-container>
            } @else {
                <ng-container *ngComponentOutlet="content; inputs: contentInputs"></ng-container>
            }
        }
    `,
})
export class DialogTemplateContentComponent {
    @Input()
    content: DialogContent | null = null;

    @Input()
    contentInputs: Record<string, unknown> | null = null;

    get isContentTemplate() {
        return this.content instanceof TemplateRef;
    }

    get isContentString() {
        return typeof this.content === 'string';
    }
}

