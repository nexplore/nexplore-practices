import '@angular/compiler';
import { ElementRef, Injector, runInInjectionContext } from '@angular/core';
import { DestroyService } from '@nexplore/practices-ui';
import { firstValueFrom } from 'rxjs';
import { SELECTION_CONFIG, SelectionConfig } from './selection.config';
import { PuibeSelectableDirective, PuibeSelectionDirective } from './selection.directive';

const tick = () => new Promise((resolve) => setTimeout(resolve, 10));

function createSelection(config?: SelectionConfig) {
    const injector = Injector.create({
        providers: config ? [{ provide: SELECTION_CONFIG, useValue: config }] : [],
    });
    return runInInjectionContext(injector, () => new PuibeSelectionDirective());
}

function createSelectable(selection: PuibeSelectionDirective, model: unknown) {
    const destroy = new DestroyService();
    const element = document.createElement('div');
    const selectable = new PuibeSelectableDirective(selection, destroy, new ElementRef(element));
    selectable.selectable = model;
    selectable.ngOnInit();
    return { selectable, element, destroy };
}

describe('PuibeSelectionDirective', () => {
    it('compares items by reference by default', () => {
        const selection = createSelection();
        selection.selectionMode = 'multi';

        selection.toggle({ id: 1 });
        selection.toggle({ id: 1 });

        expect(selection.selectedItems.length).toBe(2);
    });

    it('compares items by the property given in selectionComparisionKey', () => {
        const selection = createSelection();
        selection.selectionMode = 'multi';
        selection.selectionComparisionKey = 'id';

        selection.toggle({ id: 1 });
        expect(selection.hasSelectedItem({ id: 1 })).toBe(true);

        selection.toggle({ id: 1 }); // a reloaded item with a new reference deselects it
        expect(selection.selectedItems).toEqual([]);
    });

    it('uses the globally configured comparison key', () => {
        const selection = createSelection({ defaultSelectionComparisionKey: (item: any) => item?.id ?? item });
        selection.selectedItem = { id: 1 };

        selection.toggle({ id: 1 });

        expect(selection.selectedItem).toBeNull();
    });

    it('emits selectedItemsChange when the user toggles an item', async () => {
        const selection = createSelection();
        selection.selectionMode = 'multi';
        const change = firstValueFrom(selection.selectedItemsChange);

        selection.toggle('a');

        expect(await change).toEqual(['a']);
    });

    it('emits allSelectedExcept when an item is deselected after selecting all', async () => {
        const selection = createSelection();
        selection.selectionMode = 'multi';
        const indeterminate = firstValueFrom(selection.selectAllIndeterminate);

        selection.toggleAll(true);
        selection.toggle('a');

        expect(await indeterminate).toEqual({ allSelectedExcept: ['a'] });
    });
});

describe('PuibeSelectableDirective', () => {
    it('adds the items in view to the selection when all items are selected', async () => {
        const selection = createSelection();
        selection.selectionMode = 'multi';
        const a = createSelectable(selection, 'a');
        const b = createSelectable(selection, 'b');

        selection.toggleAll(true);
        await tick();

        expect(selection.selectedItems).toEqual(['a', 'b']);
        expect(a.element.getAttribute('aria-selected')).toBe('true');
        expect(b.element.getAttribute('aria-selected')).toBe('true');

        a.selectable.toggle();
        await tick();

        expect(selection.selectedItems).toEqual(['b']);
        expect(a.element.getAttribute('aria-selected')).toBe('false');
        expect(b.element.getAttribute('aria-selected')).toBe('true');
    });

    it('is focusable unless nonFocusable is set', () => {
        const selection = createSelection();
        const { selectable, element } = createSelectable(selection, 'a');

        expect(element.getAttribute('tabindex')).toBe('0');

        selectable.nonFocusable = true;

        expect(element.hasAttribute('tabindex')).toBe(false);
    });
});
