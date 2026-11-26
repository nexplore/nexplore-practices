import { Component, Input, TemplateRef, ViewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from '@jest/globals';
import { setupZoneTestEnv } from 'jest-preset-angular/setup-env/zone';
import { DialogTemplateContentComponent } from './dialog-template-content.component';

setupZoneTestEnv({ errorOnUnknownElements: true, errorOnUnknownProperties: true });

@Component({
    selector: 'pui-test-content',
    standalone: true,
    template: '<span class="from-component">{{ label }}</span>',
})
class TestContentComponent {
    @Input() label = '';
}

@Component({
    standalone: true,
    imports: [DialogTemplateContentComponent],
    template: `
        <ng-template #tpl let-inputs><span class="from-template">{{ inputs?.label }}</span></ng-template>
        <pui-dialog-template-content [content]="content" [contentInputs]="inputs" />
    `,
})
class HostComponent {
    @ViewChild('tpl', { static: true }) tpl!: TemplateRef<unknown>;
    content: unknown = null;
    inputs: unknown = null;
}

function render(content: (host: HostComponent) => unknown, inputs: unknown) {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.content = content(fixture.componentInstance);
    fixture.componentInstance.inputs = inputs;
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
}

describe('DialogTemplateContentComponent', () => {
    it('renders a string', () => {
        const el = render(() => 'Hello', null);
        expect(el.textContent).toContain('Hello');
    });

    it('renders a template with the inputs as implicit context', () => {
        const el = render((host) => host.tpl, { label: 'from inputs' });
        expect(el.querySelector('.from-template')?.textContent).toBe('from inputs');
    });

    it('renders a component with the inputs', () => {
        const el = render(() => TestContentComponent, { label: 'component label' });
        expect(el.querySelector('.from-component')?.textContent).toBe('component label');
    });

    it.each([null, undefined, ''])('renders nothing harmful for %p content', (content) => {
        const el = render(() => content, null);
        expect(el.querySelector('.from-template, .from-component')).toBeNull();
    });
});
