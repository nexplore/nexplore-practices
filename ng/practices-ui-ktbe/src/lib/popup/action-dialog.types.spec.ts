import { LegacyCommand } from '@nexplore/practices-ui';
import { of } from 'rxjs';
import { getActionCommandOptions, isActionCommandInput } from './action-dialog-action-utils';
import { PUIBE_DIALOG_PRESETS } from './action-dialog.types';

describe('isActionCommandInput', () => {
    it('recognizes functions and legacy commands as something to execute', () => {
        expect(isActionCommandInput(() => of(true))).toBe(true);
        expect(isActionCommandInput(LegacyCommand.create(() => of(true)))).toBe(true);
    });

    it('recognizes legacy commands that do not extend LegacyCommandBase', () => {
        expect(isActionCommandInput({ trigger: () => undefined, error$: of(), result$: of() })).toBe(true);
    });

    it('treats other values as the result of the action', () => {
        expect(isActionCommandInput(false)).toBe(false);
        expect(isActionCommandInput({ id: 42 })).toBe(false);
        expect(isActionCommandInput(null)).toBe(false);
    });
});

describe('PUIBE_DIALOG_PRESETS', () => {
    describe('confirmDelete', () => {
        it('can be created outside of an injection context, e.g. in a click handler', () => {
            const deleteAction = () => of(true);

            const config = PUIBE_DIALOG_PRESETS.confirmDelete(deleteAction);

            expect(config.actions).toEqual({ DELETE: deleteAction, CANCEL: false });
        });

        it('uses the delete status category for the delete action', () => {
            const config = PUIBE_DIALOG_PRESETS.confirmDelete(() => of(true));

            expect(config.actionCommandOptions).toEqual({ DELETE: { status: { statusCategory: 'action-delete' } } });
        });

        it('keeps the delete status category when the caller copies the actions or sets its own templates', () => {
            const preset = PUIBE_DIALOG_PRESETS.confirmDelete(() => of(true));
            const config = {
                ...preset,
                actions: { ...preset.actions },
                actionTemplates: { DELETE: { labelKey: 'App.Remove', primary: true }, CANCEL: { labelKey: 'App.No' } },
            };

            expect(config.actionCommandOptions?.DELETE).toEqual({ status: { statusCategory: 'action-delete' } });
        });

        it('applies the delete status category only to the delete action of the preset', () => {
            const deleteAction = () => of(true);
            const preset = PUIBE_DIALOG_PRESETS.confirmDelete(deleteAction);
            const ownDeleteCommand = () => of(false);

            expect(getActionCommandOptions(preset.actionCommandOptions, 'DELETE', deleteAction)).toEqual({
                status: { statusCategory: 'action-delete' },
            });
            // e.g. `{ ...preset, actions: { DELETE: ownDeleteCommand, CANCEL: false } }`: runs without the options, as in 13.x
            expect(getActionCommandOptions(preset.actionCommandOptions, 'DELETE', ownDeleteCommand)).toBeUndefined();
        });

        it('applies command options that the caller set, to any action', () => {
            const action = () => of(true);

            expect(getActionCommandOptions({ DELETE: { status: { statusCategory: 'x' } } }, 'DELETE', action)).toEqual({
                status: { statusCategory: 'x' },
            });
        });
    });
});
