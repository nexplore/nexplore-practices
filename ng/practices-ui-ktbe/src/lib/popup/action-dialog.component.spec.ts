import '@angular/compiler';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Injector, runInInjectionContext } from '@angular/core';
import { ActionDialogComponent } from './action-dialog.component';

describe('ActionDialogComponent', () => {
    function createComponent() {
        const injector = Injector.create({
            providers: [
                { provide: DIALOG_DATA, useValue: {} },
                { provide: DialogRef, useValue: {} },
            ],
        });
        return runInInjectionContext(injector, () => new ActionDialogComponent());
    }

    function isContentEmpty(component: ActionDialogComponent<any>): boolean {
        return (component as any).isContentEmpty();
    }

    function reportEmptyContent(component: ActionDialogComponent<any>) {
        (component as any).isContentEmpty.set(true);
    }

    it('should forget that the content was empty when the content is removed', () => {
        const component = createComponent();
        component.content = 'Content';
        reportEmptyContent(component);

        component.content = null;
        expect(isContentEmpty(component)).toBe(false);

        // New content gets a new puibeHideIfEmptyText, which only reports changes. The divider line must not stay hidden.
        component.content = 'Other content';
        expect(isContentEmpty(component)).toBe(false);
    });

    it('should keep the empty state while the content element stays', () => {
        const component = createComponent();
        component.content = 'Content';
        reportEmptyContent(component);

        component.content = 'Other content';

        expect(isContentEmpty(component)).toBe(true);
    });
});
