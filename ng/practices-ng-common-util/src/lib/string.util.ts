export type FirstCharToUpper<T> = T extends `${infer F}${infer R}` ? `${Uppercase<F>}${R}` : T;

export function firstCharToUpper<T extends string>(value: T): FirstCharToUpper<T> {
    return (value.charAt(0).toUpperCase() + value.slice(1)) as FirstCharToUpper<T>;
}

export function firstCharToLower<T extends string>(value: T): Lowercase<T> {
    return (value.charAt(0).toLowerCase() + value.slice(1)) as Lowercase<T>;
}
