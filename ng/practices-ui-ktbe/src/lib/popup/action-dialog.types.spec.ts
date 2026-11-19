import { of } from 'rxjs';
import { PUIBE_DIALOG_ACTIONS, PUIBE_DIALOG_PRESETS } from './action-dialog.types';

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
