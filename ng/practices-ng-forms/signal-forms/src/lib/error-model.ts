import type { ValidationErrors } from '@angular/forms';
import {
    EmailValidationError,
    emailError,
    MaxLengthValidationError,
    MaxValidationError,
    MinLengthValidationError,
    MinValidationError,
    PatternValidationError,
    requiredError,
    RequiredValidationError,
    type ValidationError,
} from '@angular/forms/signals';

/**
 * A validation error as it is stored in the signal form tree.
 *
 * Errors coming from Reactive Forms style validators (`ValidatorFn`, `ValidationErrors` literals, async validators)
 * are carried as a `PuiValidationError`: `kind` is the key of the `ValidationErrors` record, `payload` its value.
 *
 * Native Signal Forms errors (`required`, `email`, ...) are kept as they are.
 */
export class PuiValidationError implements ValidationError {
    constructor(
        /** The key of the error, identical to the key in the `ValidationErrors` record of Reactive Forms. */
        readonly kind: string,
        /** The value of the error as it appears in the `ValidationErrors` record (`true` if there are no details). */
        readonly payload: unknown = true,
        /** Optional human readable message (not representable in a `ValidationErrors` record). */
        readonly message?: string
    ) {}
}

/**
 * Converts a Reactive Forms style `ValidationErrors` record into a list of Signal Forms errors.
 */
export function fromValidationErrors(errors: ValidationErrors | null | undefined): ValidationError.WithoutFieldTree[] {
    if (!errors) {
        return [];
    }

    return Object.entries(errors).map(([key, payload]) => {
        if (key === 'required' && payload === true) {
            return requiredError();
        }
        if (key === 'email' && payload === true) {
            return emailError();
        }
        return new PuiValidationError(key, payload);
    });
}

const NATIVE_KEY_MAP: Record<string, string> = {
    minLength: 'minlength',
    maxLength: 'maxlength',
};

/**
 * Converts Signal Forms errors into a Reactive Forms style `ValidationErrors` record (`null` if there are none).
 *
 * Mapping of the native Signal Forms errors (to keep existing error rendering like `Messages.Validation_Minlength` working):
 *
 * | Signal Forms kind | `ValidationErrors` entry |
 * | --- | --- |
 * | `required` | `{ required: true }` |
 * | `email` | `{ email: true }` |
 * | `min` / `max` | `{ min: { min, actual } }` / `{ max: { max, actual } }` |
 * | `minLength` / `maxLength` | `{ minlength: { requiredLength, actualLength } }` / `{ maxlength: ... }` |
 * | `pattern` | `{ pattern: { requiredPattern, actualValue } }` |
 * | `PuiValidationError` | `{ [kind]: payload }` |
 * | any other error | `{ [kind]: { message?, ...own properties } }` or `true` when there are no details |
 *
 * @param errors The errors of one field.
 * @param value The current value of the field (used to fill in the `actual...` details).
 */
export function toValidationErrors(errors: ReadonlyArray<ValidationError>, value: unknown): ValidationErrors | null {
    if (!errors.length) {
        return null;
    }

    const result: ValidationErrors = {};
    for (const error of errors) {
        if (error instanceof PuiValidationError) {
            result[error.kind] = error.payload;
        } else if (error instanceof RequiredValidationError) {
            result['required'] = true;
        } else if (error instanceof EmailValidationError) {
            result['email'] = true;
        } else if (error instanceof MinValidationError) {
            result['min'] = { min: error.min, actual: value };
        } else if (error instanceof MaxValidationError) {
            result['max'] = { max: error.max, actual: value };
        } else if (error instanceof MinLengthValidationError) {
            result['minlength'] = { requiredLength: error.minLength, actualLength: (value as any)?.length };
        } else if (error instanceof MaxLengthValidationError) {
            result['maxlength'] = { requiredLength: error.maxLength, actualLength: (value as any)?.length };
        } else if (error instanceof PatternValidationError) {
            result['pattern'] = { requiredPattern: String(error.pattern), actualValue: value };
        } else {
            const {
                kind,
                fieldTree: _fieldTree,
                formField: _formField,
                ...details
            } = error as ValidationError & {
                fieldTree?: unknown;
                formField?: unknown;
            };
            result[NATIVE_KEY_MAP[kind] ?? kind] = Object.keys(details).length ? details : true;
        }
    }

    return result;
}
