import '@angular/compiler';
import { ElementRef } from '@angular/core';
import { DestroyService } from '@nexplore/practices-ui';
import { TranslateService } from '@ngx-translate/core';
import { EMPTY, Subject } from 'rxjs';
import { FormFieldService } from '../form-field/form-field.service';
import { PuibeFileInputDirective } from './file-input.directive';

describe('PuibeFileInputDirective', () => {
    const defaultPlaceholder = 'No file selected';

    let directive: PuibeFileInputDirective;
    let updateOverlayText: jest.Mock;

    beforeEach(() => {
        updateOverlayText = jest.fn();
        const formFieldService = {
            updateOverlayText,
            setOverlayText: jest.fn(),
            setIcon: jest.fn(),
            value$: EMPTY,
            iconClick$: EMPTY,
        } as unknown as FormFieldService;
        const translate = { instant: () => defaultPlaceholder } as unknown as TranslateService;

        directive = new PuibeFileInputDirective(
            new ElementRef(document.createElement('input')),
            formFieldService,
            new Subject<void>() as unknown as DestroyService,
            translate
        );
    });

    it('shows the placeholder again when the value is reset', () => {
        directive.ngOnInit();
        directive.writeValue(new File([], 'document.pdf'));
        updateOverlayText.mockClear();

        directive.writeValue(null);

        expect(updateOverlayText).toHaveBeenCalledWith({ text: defaultPlaceholder });
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
});
