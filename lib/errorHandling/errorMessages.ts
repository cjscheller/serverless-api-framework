/* Validation error messages */

export const PASSWORD_INVALID_MSG = `Password must be 8+ characters with one lowercase, uppercase, and number character.`;

/**
 * Build error message for validation error where require param is missing
 *
 * @param   {string} param name of missing parameter
 * @returns {string} error message
 */
export function paramRequiredErrMsg(missing: string) {
    return `Missing required parameter \`${missing}\``;
}

/**
 * Build error message for validation error where param has invalid type
 *
 * @param   {string} param       name of parameter w/ invalid type
 * @param   {string} correctType intended type of parameter
 * @returns {string} error message
 */
export function invalidTypeErrMsg(param: string, correctType: string) {
    return `\`${param}\` must be of type ${correctType}`;
}

/**
 * Build error message for validation error where param has insufficent length
 *
 * @param   {string} param     name of parameter w/ insufficient length
 * @param   {string} minLength intended minimum length of parameter
 * @returns {string} error message
 */
export function minLengthErrMsg(param: string, minLength: number) {
    if (minLength === 1) {
        return `\`${param}\` must not be empty`;
    } else {
        return `\`${param}\` must NOT be shorter than ${minLength} character${
            minLength > 1 ? "s" : ""
        }`;
    }
}

/**
 * Build error message for validation error where an array has an insufficent # of items
 *
 * @param   {string} param     name of parameter w/ insufficient # of items
 * @param   {string} minLength intended minimum length of parameter
 * @returns {string} error message
 */
export function arrayMinItemsErrMsg(param: string, minLength: number) {
    if (minLength === 1) {
        return `\`${param}\` must not be empty`;
    } else {
        return `\`${param}\` must have at least ${minLength} item${minLength > 1 ? "s" : ""}`;
    }
}

/**
 * Build error message for validation error where items of array are invalid type
 *
 * @param   {string} param       name of parameter w/ invalid type
 * @param   {string} correctType intended type of parameter
 * @returns {string} error message
 */
export function invalidArrayItemsTypeErrMsg(param: string, correctType: string) {
    return `\`${param}\` array must contain items of type ${correctType}`;
}

/**
 * Build validation error message for request with unspecified, additional properties
 *
 * @param   {Array<string>} additionalProperties  list of additional properties
 * @returns {string} error message
 */
export function additionalPropertiesErrMsg(additionalProperties: Array<string>) {
    const propertyString = additionalProperties.join(", ");
    return `Request must not include additional properties (\`${propertyString}\`)`;
}

/**
 * Build validation error message for invalid enum option provided
 *
 * @param   {string}   param         name of parameter w/ enum type
 * @param   {string[]} allowedValues allowed values for enum
 * @returns {string}   error message
 */
export function invalidEnumErrMsg(param: string, allowedValues: string[]) {
    return `\`${param}\` must be one of the allowed values [${allowedValues.join(",")}]`;
}

/**
 * Build error message for validation error where parameter does not satisfy format requirement
 *
 * @param   {string} param  name of parameter w/ invalid format
 * @param   {string} format intended parameter format (ex: email)
 * @returns {string} error message
 */
export function invalidFormat(param: string, format: string) {
    return `\`${param}\` does not meet format requirements for type ${format}`;
}

/**
 * Build error message for resource not found error
 *
 * @param   {string}        resourceType  resource type (ie "Customer")
 * @param   {string|number} id            id that did not match existing resource
 * @returns {string} error message
 */
export function resourceNotFound(resourceType: string, id: string | number) {
    return `${capitalize(resourceType.replace("_", " "))} with ID '${id}' not found`;
}

/**
 * Build error message for resource not found error when a specific resource ID is not available
 *
 * @param   {string}        resourceType  resource type (ie "Customer")
 * @returns {string} error message
 */
export function unspecifedResourceNotFound(resourceType: string) {
    return `${capitalize(resourceType.replace("_", " "))} resource not found`;
}

/**
 * Converts first letter of string to uppercase, remainder to lowercase
 *
 * @param {string} str
 * @returns {string}
 */
function capitalize(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
