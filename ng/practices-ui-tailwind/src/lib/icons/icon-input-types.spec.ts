import { describe, expect, it } from '@jest/globals';
import { IconDirection, IconDirectionInput, IconSize, IconSizeInput } from './icon.interface';
import { applyIconDirection } from './util';

describe('icon inputs', () => {
    it('accept the string values of the enums, as used by static template attributes', () => {
        // Compile time check: `direction="left"` and `size="m"` in a template must type check
        const direction: IconDirectionInput = 'left';
        const size: IconSizeInput = 'm';

        expect(direction).toBe(IconDirection.LEFT);
        expect(size).toBe(IconSize.M);
    });

    it('applyIconDirection rotates for enum members and their string values alike', () => {
        const fromEnum = document.createElement('div');
        const fromString = document.createElement('div');

        applyIconDirection(IconDirection.LEFT, IconDirection.RIGHT, fromEnum);
        applyIconDirection('left', 'right', fromString);

        expect(fromString.className).toBe(fromEnum.className);
        expect(fromString.classList.contains('rotate-180')).toBe(true);
    });

    it('applyIconDirection resets the rotation without a direction', () => {
        const element = document.createElement('div');
        applyIconDirection('left', 'right', element);

        applyIconDirection(undefined as unknown as IconDirectionInput, 'right', element);

        expect(element.classList.contains('rotate-180')).toBe(false);
    });
});
