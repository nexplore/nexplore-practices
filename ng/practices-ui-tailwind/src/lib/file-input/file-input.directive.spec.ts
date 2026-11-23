import '@angular/compiler';
import { createEnvironmentInjector, ElementRef, runInInjectionContext } from '@angular/core';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { DestroyService } from '@nexplore/practices-ui';
import { TranslateService } from '@ngx-translate/core';
import { EMPTY, Subject } from 'rxjs';
import { FormFieldService } from '../form-field/form-field.service';
import { PuiFileInputDirective } from './file-input.directive';

describe('PuiFileInputDirective', () => {
    const defaultPlaceholder = 'No file selected';

    let directive: PuiFileInputDirective;
    let updateOverlayText: jest.Mock;
    let setOverlayText: jest.Mock;
    let value$: Subject<File | string | null>;

    beforeEach(() => {
        updateOverlayText = jest.fn();
        setOverlayText = jest.fn();
        value$ = new Subject();
        const formFieldService = {
            updateOverlayText,
            setOverlayText,
            setIcon: jest.fn(),
            value$,
            iconClick$: EMPTY,
        };
        const injector = createEnvironmentInjector(
            [
                { provide: ElementRef, useValue: new ElementRef(document.createElement('input')) },
                { provide: FormFieldService, useValue: formFieldService },
                { provide: DestroyService, useValue: new Subject<void>() },
                { provide: TranslateService, useValue: { instant: () => defaultPlaceholder } },
            ],
            null as never,
        );

        directive = runInInjectionContext(injector, () => new PuiFileInputDirective());
    });

    describe('writeValue', () => {
        it('shows the placeholder again when the value is reset', () => {
            directive.ngOnInit();
            directive.writeValue(new File([], 'document.pdf'));
            updateOverlayText.mockClear();

            directive.writeValue(null);

            expect(updateOverlayText).toHaveBeenCalledWith({ text: defaultPlaceholder });
        });

        it('shows the placeholder for an empty string', () => {
            directive.ngOnInit();

            directive.writeValue('');

            expect(updateOverlayText).toHaveBeenLastCalledWith({ text: defaultPlaceholder });
        });

        it('shows a custom placeholder when the value is reset', () => {
            directive.placeholder = 'Upload your CV';
            directive.ngOnInit();

            directive.writeValue(null);

            expect(updateOverlayText).toHaveBeenLastCalledWith({ text: 'Upload your CV' });
        });

        it('shows the file name of a written file', () => {
            directive.ngOnInit();

            directive.writeValue(new File([], 'document.pdf'));

            expect(updateOverlayText).toHaveBeenLastCalledWith({ text: 'document.pdf' });
        });

        it('shows a written string value as is', () => {
            directive.ngOnInit();

            directive.writeValue('existing.pdf');

            expect(updateOverlayText).toHaveBeenLastCalledWith({ text: 'existing.pdf' });
        });

        it('keeps a value written before initialization', () => {
            directive.writeValue('existing.pdf');

            directive.ngOnInit();

            expect(setOverlayText).toHaveBeenLastCalledWith({ text: 'existing.pdf' });
        });
    });

    describe('value changes', () => {
        beforeEach(() => directive.ngOnInit());

        it('shows a string value as is', () => {
            value$.next('existing.pdf');

            expect(updateOverlayText).toHaveBeenLastCalledWith({ text: 'existing.pdf' });
        });

        it('shows the file name of a file', () => {
            value$.next(new File([], 'document.pdf'));

            expect(updateOverlayText).toHaveBeenLastCalledWith({ text: 'document.pdf' });
        });

        it('shows the placeholder for an empty value', () => {
            value$.next(null);

            expect(updateOverlayText).toHaveBeenLastCalledWith({ text: defaultPlaceholder });
        });
    });
});
