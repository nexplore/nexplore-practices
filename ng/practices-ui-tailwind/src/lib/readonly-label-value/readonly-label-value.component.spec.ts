import { describe, expect, it } from '@jest/globals';
import { setupZoneTestEnv } from 'jest-preset-angular/setup-env/zone';
import * as readonlyLabelValue from './readonly-label-value.component';

setupZoneTestEnv();

interface ComponentDef {
    selectors: string[][];
}

describe('readonly-label-value', () => {
    it('defines exactly one component for the selector pui-readonly-label-value', () => {
        // A second (deprecated, misspelled) component with the same selector made Angular log NG0912
        // (component ID collision) in every application
        const definitions = Object.values(readonlyLabelValue)
            .map((value) => (value as unknown as { ɵcmp?: ComponentDef }).ɵcmp)
            .filter((def): def is ComponentDef => !!def);

        expect(definitions).toHaveLength(1);
        expect(definitions[0].selectors).toEqual([['pui-readonly-label-value']]);
        expect(Object.keys(readonlyLabelValue)).toEqual(['PuiReadonlyLabelValueComponent']);
    });
});
