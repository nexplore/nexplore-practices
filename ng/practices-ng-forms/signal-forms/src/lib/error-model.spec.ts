import { emailError, maxError, maxLengthError, minError, minLengthError, patternError, requiredError } from '@angular/forms/signals';
import { fromValidationErrors, PuiValidationError, toValidationErrors } from './error-model';

describe('error model', () => {
    it('converts ValidationErrors records to signal form errors and back', () => {
        const errors = fromValidationErrors({ required: true, email: true, custom: { a: 1 } });
        expect(errors.map((e) => e.kind)).toEqual(['required', 'email', 'custom']);
        expect(errors[2]).toBeInstanceOf(PuiValidationError);
        expect(toValidationErrors(errors, 'x')).toEqual({ required: true, email: true, custom: { a: 1 } });
        expect(fromValidationErrors(null)).toEqual([]);
        expect(toValidationErrors([], 'x')).toBeNull();
    });

    it('maps native errors to the Reactive Forms keys and details', () => {
        const result = toValidationErrors(
            [requiredError(), emailError(), minError(3), maxError(5), minLengthError(2), maxLengthError(4), patternError(/a/)] as any,
            'value'
        );
        expect(result).toEqual({
            required: true,
            email: true,
            min: { min: 3, actual: 'value' },
            max: { max: 5, actual: 'value' },
            minlength: { requiredLength: 2, actualLength: 5 },
            maxlength: { requiredLength: 4, actualLength: 5 },
            pattern: { requiredPattern: '/a/', actualValue: 'value' },
        });
    });

    it('keeps unknown kinds with their details and messages out of the record', () => {
        const result = toValidationErrors(
            [{ kind: 'server', message: 'nope', code: 7, fieldTree: {} }, { kind: 'plain' }] as any,
            null
        );
        expect(result).toEqual({ server: { message: 'nope', code: 7 }, plain: true });
    });

    it('carries messages of PuiValidationError without putting them into the record', () => {
        const error = new PuiValidationError('taken', { by: 1 }, 'already taken');
        expect(error.message).toBe('already taken');
        expect(toValidationErrors([error], '')).toEqual({ taken: { by: 1 } });
    });
});
