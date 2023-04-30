/**
 * Create a deep clone of a *simple* object using JSON parse + stringify
 * Note this will fail to serialize any complex types like dates, functions, etc
 *
 * @param   {object} source Object to copy
 * @returns {object}
 */
export function deepClone(source: any) {
    return JSON.parse(JSON.stringify(source));
}
