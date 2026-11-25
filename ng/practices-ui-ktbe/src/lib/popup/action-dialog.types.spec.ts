import { LegacyCommand } from '@nexplore/practices-ui';
import { of } from 'rxjs';
import { getPresetActionCommandOptions, isActionCommandInput } from './action-dialog-action-utils';
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

            expect(getPresetActionCommandOptions(config.actions!, 'DELETE')).toEqual({
                status: { statusCategory: 'action-delete' },
            });
            expect(getPresetActionCommandOptions(config.actions!, 'CANCEL')).toBeUndefined();
        });

        it('keeps the delete status category when the caller sets its own action templates', () => {
            const config = {
                ...PUIBE_DIALOG_PRESETS.confirmDelete(() => of(true)),
                actionTemplates: { DELETE: { labelKey: 'App.Remove', primary: true }, CANCEL: { labelKey: 'App.No' } },
            };

            expect(config.actionTemplates.DELETE).not.toHaveProperty('commandOptions');
            expect(getPresetActionCommandOptions(config.actions!, 'DELETE')).toEqual({
                status: { statusCategory: 'action-delete' },
            });
        });

        it('does not mark the delete action itself, so it can be reused elsewhere', () => {
            const deleteAction = () => of(true);
            PUIBE_DIALOG_PRESETS.confirmDelete(deleteAction);

            expect(getPresetActionCommandOptions({ DELETE: deleteAction }, 'DELETE')).toBeUndefined();
        });
    });
});
