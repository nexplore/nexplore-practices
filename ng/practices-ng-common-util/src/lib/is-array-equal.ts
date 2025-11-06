/**
 * Compares two arrays for equality by checking if they have the same length and 
 * if each element at the same index is identical (===).
 *
 * @param arr1 The first array to compare.
 * @param arr2 The second array to compare.
 * @returns `true` if the arrays are equal, `false` otherwise.
 */
export function isArrayEqual<T>(arr1: T[], arr2: T[]): boolean {
    return arr1.length === arr2.length && arr1.every((value, index) => value === arr2[index]);
}
