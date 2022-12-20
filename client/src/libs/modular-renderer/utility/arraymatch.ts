/**
 * Checks if two arrays have the same elements (does not check dupes or order, treats arrays as sets)
 * @param a1 First array
 * @param a2 Second array
 * @returns true if all items appear in both arrays, false otherwise
 */
export function matchArrays(a1: any[], a2: any[]): boolean {
    for (let k of a1) {
        if (!a2.includes(k)) {
            return false;
        }
    }
    for (let k of a2) {
        if (!a1.includes(k)) {
            return false;
        }
    }
    return true;
}
