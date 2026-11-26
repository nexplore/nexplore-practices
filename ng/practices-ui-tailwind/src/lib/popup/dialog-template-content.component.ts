import { NgComponentOutlet, NgTemplateOutlet } from '@angular/common';
import { Component, Input, TemplateRef, Type } from '@angular/core';
import { DialogContent } from './action-dialog.types';

@Component({
    selector: 'pui-dialog-template-content',
    standalone: true,
    imports: [NgComponentOutlet, NgTemplateOutlet],
    template: `
        @if (isContentString) {
            {{ content }}
        } @else {
            @if (templateContent) {
                <ng-container *ngTemplateOutlet="templateContent; context: { $implicit: inputs }"></ng-container>
            } @else {
                <ng-container *ngComponentOutlet="componentContent; inputs: inputs"></ng-container>
            }
        }
    `,
})
export class DialogTemplateContentComponent {
    @Input()
    content: DialogContent | null = null;

    /** Inputs of the content component, or the `$implicit` context of the content template */
    @Input()
    contentInputs: unknown = null;

    get inputs(): Record<string, unknown> | null {
        return (this.contentInputs as Record<string, unknown> | null) ?? null;
    }

    get templateContent(): TemplateRef<unknown> | null {
        return this.content instanceof TemplateRef ? this.content : null;
    }

    get componentContent(): Type<unknown> | null {
        return typeof this.content === 'function' ? (this.content as Type<unknown>) : null;
    }

    get isContentTemplate() {
        return this.content instanceof TemplateRef;
    }

    get isContentString() {
        return typeof this.content === 'string';
    }
}

