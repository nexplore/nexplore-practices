export type PuibeSelectionMode = 'disabled' | 'single' | 'multi';

/**
 * Emitted by `selectAllIndeterminate`, when the user changes the selection of single items after all items have been (de-)selected.
 */
export type PuibeSelectAllIndeterminateEvent = {
    /** All items have been selected, except the given ones. */
    allSelectedExcept?: unknown[];
    /** All items have been deselected, except the given ones. */
    allDeselectedExcept?: unknown[];
};
