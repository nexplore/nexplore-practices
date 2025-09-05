import { createTypedFactory } from "./create-select-view-source";

type TypedSelectViewSourceFactoryFluentApi<TData> = {
    withConfig: ReturnType<typeof createTypedFactory<TData>>,
}

/**
 * Creates a typed SelectViewSource fluent builder.
 */
export function createSelectViewSourceWithType<
    TData
>() : TypedSelectViewSourceFactoryFluentApi<TData> {
    return {
        withConfig: createTypedFactory<TData>()
    }
}
