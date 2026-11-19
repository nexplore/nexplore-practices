import { LegacyCommand } from '@nexplore/practices-ui';
import { of } from 'rxjs';
import { isActionCommandInput, PUIBE_DIALOG_ACTIONS, PUIBE_DIALOG_PRESETS } from './action-dialog.types';

describe('isActionCommandInput', () => {
    it('recognizes functions and legacy commands as something to execute', () => {
        expect(isActionCommandInput(() => of(true))).toBe(true);
        expect(isActionCommandInput(LegacyCommand.create(() => of(true)))).toBe(true);
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

            expect(config.actionTemplates?.DELETE).toEqual({
                ...PUIBE_DIALOG_ACTIONS.DELETE,
                commandOptions: { status: { statusCategory: 'action-delete' } },
            });
        });

        it('does not change the default action templates', () => {
            PUIBE_DIALOG_PRESETS.confirmDelete(() => of(true));

            expect('commandOptions' in PUIBE_DIALOG_ACTIONS.DELETE).toBe(false);
        });
    });
});
