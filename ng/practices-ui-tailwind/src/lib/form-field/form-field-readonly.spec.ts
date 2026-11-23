import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NgControl } from '@angular/forms';
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { PuiFormFieldService, PuiReadonlyDirective } from '@nexplore/practices-ng-forms';
import { TranslateModule } from '@ngx-translate/core';
import { setupZoneTestEnv } from 'jest-preset-angular/setup-env/zone';
import { of, Subject } from 'rxjs';
import { PuiFormFieldComponent } from './form-field.component';

setupZoneTestEnv({ errorOnUnknownElements: true, errorOnUnknownProperties: true });

@Component({
    standalone: true,
    imports: [PuiFormFieldComponent],
    template: `<pui-form-field readonlyEmptyValuePlaceholder="none"></pui-form-field>`,
})
class HostComponent {}

describe('pui-form-field in readonly mode', () => {
    beforeEach(() => jest.useFakeTimers());
    afterEach(() => jest.useRealTimers());

    /** Renders the field readonly with a form control holding `value`, returns what the field displays. */
    function displayedFor(value: unknown): string {
        TestBed.configureTestingModule({
            imports: [HostComponent, TranslateModule.forRoot()],
            providers: [{ provide: PuiReadonlyDirective, useValue: { isReadonly$: of(true) } }],
        });
        const fixture = TestBed.createComponent(HostComponent);
        const service = fixture.debugElement.children[0].injector.get(PuiFormFieldService);
        service.setReadonlyValueFunction(() => value as never);
        const ngControl = { value, status: 'VALID', valueChanges: new Subject() } as unknown as NgControl;
        service.registerNgControl(ngControl, document.createElement('input'));
        fixture.detectChanges();
        jest.advanceTimersByTime(1); // the control is published with delay(0)
        fixture.detectChanges();
        return (fixture.nativeElement as HTMLElement).textContent?.replace(/\s+/g, ' ').trim() ?? '';
    }

    it('shows text', () => {
        expect(displayedFor('hello')).toContain('hello');
    });

    it('shows the number 0 instead of the placeholder', () => {
        const text = displayedFor(0);

        expect(text).toContain('0');
        expect(text).not.toContain('none');
    });

    it.each([
        ['null', null],
        ['undefined', undefined],
        ['an empty string', ''],
    ])('shows the placeholder for %s', (_label, value) => {
        expect(displayedFor(value)).toContain('none');
    });
});
