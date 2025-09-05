import { TemplateRef, Type } from '@angular/core';
import { CommandInput, command } from '@nexplore/practices-ng-commands';
import { CombinedCommandInput } from '@nexplore/practices-ui';
import { Variant } from '../button/button.directive';

export type DialogAction<TAction> = TAction & { command?: CommandInput<void, any> };

export type DialogContent = string | TemplateRef<unknown> | Type<unknown>;

export interface PuibeDialogActionTemplate<TResult = any, TArgs = void> {
    label?: string;
    labelKey?: string;
    primary?: boolean;
    variant?: Variant;
    command?: CombinedCommandInput<TArgs, TResult>;
    representsDialogClose?: boolean;
}

export type PuibeDialogActionsTemplates<TResult = unknown, TArgs = void> = {
    [key: string]: PuibeDialogActionTemplate<TResult, TArgs>;
};
export const PUIBE_DIALOG_ACTIONS = {
    SAVE: { labelKey: 'Practices.Labels_Save', primary: true },
    CONFIRM: { labelKey: 'Practices.Labels_Confirm', primary: true },
    CREATE: { labelKey: 'Practices.Labels_Create', primary: true },
    DELETE: { labelKey: 'Practices.Labels_Delete', primary: true },
    DISCARD_CHANGES: { labelKey: 'Practices.Labels_DiscardChanges', primary: true },
    OK: { labelKey: 'Practices.Labels_Ok' },
    CANCEL: { labelKey: 'Practices.Labels_Cancel', representsDialogClose: true },
    YES: { labelKey: 'Practices.Labels_Yes' },
    NO: { labelKey: 'Practices.Labels_No' },
} satisfies PuibeDialogActionsTemplates;

export type PuibeDialogActionMap<
    TActionTemplates extends PuibeDialogActionsTemplates<TResult, TArgs>,
    TResult,
    TArgs = void
> = {
    [key in keyof TActionTemplates]?: CombinedCommandInput<TArgs, TResult> | TResult | false;
};

export type PuibeDialogActionMapUntyped = {
    [key: string | symbol | number]: CombinedCommandInput<any, any> | unknown;
};

export type PuibeActionDialogConfigBasics = {
    title?: DialogContent;

    /**
     * A translation key for the title
     */
    titleKey?: string;

    /** Subtitle can be either a string, an `ng-template`, or an Component type.
     *
     * If a template or component is used, you can pass data to it using the CDKs `DialogConfig.data` parameter passed to the `PuibeActionDialogService.showAsync` method.
     */
    subtitle?: DialogContent;

    /**
     * A translation key for the subtitle text
     */
    subtitleKey?: string;

    /** Content can be either a string, an `ng-template`, or an Component type.
     *
     * If a template or component is used, you can pass data to it using the CDKs `DialogConfig.data` parameter passed to the `PuibeActionDialogService.showAsync` method.
     */
    content?: DialogContent;

    /**
     * Data to pass to the content component as inputs or template as implicit context.
     */
    contentInputs?: unknown;

    /**
     * A translation key for the content text
     */
    contentKey?: string;

    /** If `true`, when an error occurs, the dialog gets closed and the error gets rethrown. */
    errorClosesDialog?: boolean;

    /** If `true`, hides the small close icon-button  */
    hideCloseButton?: boolean;
};

export type PuibeActionDialogConfigUntyped = PuibeActionDialogConfigBasics & {
    actionTemplates?: PuibeDialogActionsTemplates;

    actions?: PuibeDialogActionMapUntyped | PuibeDialogActionTemplate<any, any>[];

    command?: CombinedCommandInput<any, any>;
};

export interface PuibeActionDialogConfig<
    TAction extends PuibeDialogActionTemplate<TResult, TArgs>,
    TResult,
    TActionTemplates extends PuibeDialogActionsTemplates<TResult, TArgs> = typeof PUIBE_DIALOG_ACTIONS,
    TArgs = void,
    TActions = TAction[] | PuibeDialogActionMap<TActionTemplates, TResult, TArgs>
> extends PuibeActionDialogConfigBasics {
    /**
     * Defintion for the button actions visual representation
     */
    actionTemplates?: TActionTemplates;

    actions?: TActions;

    command?: CombinedCommandInput<TAction, TResult>;
}

export const PUIBE_DIALOG_PRESETS = {
    confirmDelete: <TResult, TArgs = void>(
        deleteAction: CombinedCommandInput<TArgs, TResult>,
        overrideConfig?: Partial<PuibeActionDialogConfigBasics>
    ): NoInfer<
        PuibeActionDialogConfig<
            typeof PUIBE_DIALOG_ACTIONS.DELETE | typeof PUIBE_DIALOG_ACTIONS.CANCEL,
            TResult | false,
            typeof PUIBE_DIALOG_ACTIONS,
            TArgs
        >
    > => ({
        actions: {
            DELETE: command.fromInput(deleteAction, { status: { statusCategory: 'action-delete' } }),
            CANCEL: false,
        },
        titleKey: 'Practices.Labels_Delete',
        contentKey: 'Practices.Labels_DeletePrompt',
        ...overrideConfig,
    }),

    confirmDiscardUnsavedChanges: <TResult, TArgs = void>(
        discardAction: CombinedCommandInput<TArgs, TResult> | TResult,
        overrideConfig?: Partial<PuibeActionDialogConfigBasics>
    ): NoInfer<
        PuibeActionDialogConfig<
            typeof PUIBE_DIALOG_ACTIONS.DISCARD_CHANGES | typeof PUIBE_DIALOG_ACTIONS.CANCEL,
            TResult | false,
            typeof PUIBE_DIALOG_ACTIONS,
            TArgs
        >
    > => ({
        actions: { DISCARD_CHANGES: discardAction, CANCEL: false },
        titleKey: 'Practices.Labels_DiscardChanges',
        contentKey: 'Practices.Labels_DiscardChangesPrompt',
        ...overrideConfig,
    }),
};
