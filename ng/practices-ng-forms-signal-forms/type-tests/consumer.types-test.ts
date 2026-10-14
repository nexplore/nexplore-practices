// Compile-only consumer probe for `createSignalFormControl`'s public typing.
//
// This simulates an external strict consumer: it is never imported by `src/index.ts`
// (so it ships in neither the jest run nor the published package) and is type-checked
// on its own via the `typecheck` script. It guards against the schema/options generic
// parameter silently widening to `unknown`, which previously made every field access
// inside a schema fail with TS2339 regardless of whether the access was valid.
import { createSignalFormControl, required } from '../src/index';

interface Person {
    name: string;
    age: number;
}

// Inferred T (from `value`) must keep the schema's field-level typing.
const inferred = createSignalFormControl({ name: '', age: 0 }, (path) => {
    required(path.name);
});
const inferredValue: Person = inferred.value;

// Explicit T must keep the same field-level typing as the inferred case.
const explicit = createSignalFormControl<Person>({ name: '', age: 0 }, (path) => {
    required(path.name);
});
const explicitValue: Person = explicit.value;

// `options` in the 2nd position (no schema).
const withOptionsOnly = createSignalFormControl<Person>({ name: '', age: 0 }, { name: 'person' });
const withOptionsOnlyValue: Person = withOptionsOnly.value;

// `options` in the 3rd position (schema in the 2nd).
const withSchemaAndOptions = createSignalFormControl<Person>(
    { name: '', age: 0 },
    (path) => required(path.name),
    { name: 'person' }
);
const withSchemaAndOptionsValue: Person = withSchemaAndOptions.value;

// `value` only.
const valueOnly = createSignalFormControl<Person>({ name: '', age: 0 });
const valueOnlyValue: Person = valueOnly.value;

// Negative: a field that does not exist on the model must still fail to typecheck.
createSignalFormControl<Person>({ name: '', age: 0 }, (path) => {
    // @ts-expect-error `nickname` is not a property of `Person`.
    required(path.nickname);
});

// Negative: the value must still match the explicit generic argument.
// @ts-expect-error `'wrong-type'` is not assignable to `Person`.
createSignalFormControl<Person>('wrong-type');

// Negative: unknown `options` properties must still be rejected.
createSignalFormControl<Person>(
    { name: '', age: 0 },
    // @ts-expect-error `bogus` is not a property of `FormOptions<Person>`.
    { bogus: true }
);
