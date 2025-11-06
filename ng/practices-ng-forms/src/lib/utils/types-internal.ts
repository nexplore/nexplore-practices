export type ElementsOfArray<TArray> = TArray extends Array<infer TElement> ? TElement : never;
