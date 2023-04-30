import createError from "http-errors";
import ErrorTypes from "./errorTypes.js";
import { resourceNotFound, unspecifedResourceNotFound } from "./errorMessages.js";

/**
 * Throws 400 Bad Request error
 *
 * @returns HTTP Error
 */
export function BadRequest() {
    return new createError.BadRequest();
}

/**
 * Throws 401 Unauthorized error
 *
 * @returns HTTP Error
 */
export function Unauthorized() {
    return new createError.Unauthorized();
}

/**
 * Throws 404 Not Found error for resource type
 *
 * @param   {string}         resourceType  resource type (ie "Customer") not found
 * @param   {string|number?} id            id that did not match existing resource
 * @returns HTTP Error
 */
export function NotFound(resourceType: string, id: string | number = "") {
    return new createError.NotFound({
        type: ErrorTypes.NOT_FOUND,
        message: id ? resourceNotFound(resourceType, id) : unspecifedResourceNotFound(resourceType),
        code: `${resourceType.toUpperCase()}_NOT_FOUND`,
    });
}

/**
 * Throws 409 Conflict error. Commonly used for inputs that break unique constraints
 *
 * @param   {string} message Error message
 * @param   {string} code    Error code (for now, loose text)
 * @returns HTTP Error
 */
export function Conflict(message: string, code: string) {
    return new createError.Conflict({
        type: ErrorTypes.CONFLICT,
        message,
        code,
    });
}

/**
 * Throws 500 Internal Server Error for undefined errors
 *
 * @returns HTTP Error
 */
export function InternalError() {
    return new createError.InternalServerError();
}
