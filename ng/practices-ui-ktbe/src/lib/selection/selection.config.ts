import { InjectionToken } from '@angular/core';

export type SelectionConfig = {
    /**
     * Applies to the `puibeSelection` directive.
     * Returns the key used to compare items for selection.
     * This is used to determine if an item is already selected and especially important in scenarios where data is reloaded and new references are created.
     *
     * Can be overridden per instance with the `selectionComparisionKey` input.
     */
    defaultSelectionComparisionKey: (item: unknown) => unknown;
};

export const SELECTION_CONFIG = new InjectionToken<SelectionConfig>('SelectionConfig');
