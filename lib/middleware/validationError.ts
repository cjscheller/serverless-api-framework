import ErrorTypes from "../errorHandling/errorTypes.js";
import * as ErrorMessage from "../errorHandling/errorMessages.js";
import { ValidationError } from "ajv";
import { httpResponseSerializer } from "./httpResponseSerializer.js";

/**
 * Capture and handle validation errors
 */
export default {
    onError: (request) => {
        // Check if error is AJV validation error
        if (request.error instanceof ValidationError) {
            // Define request.error in the event that httpErrorHandler formalizes
            // this error into a response (not positive this is required)
            request.error = {
                statusCode: 400,
                body: {
                    type: ErrorTypes.VALIDATION_ERROR,
                    message: buildValidationMessage(request.error.errors),
                },
                expose: true,
            };

            // Build structured response with validation error
            request.response = {
                ...request.response,
                statusCode: request.error.statusCode,
                body: request.error.body,
            };

            // Serialize error response
            httpResponseSerializer(request);
        }
    },
};

/**
 * Convert AJV validation object into human-readable error message
 * OPEN Q: Should I use a library instead? https://www.npmjs.com/package/better-ajv-errors
 *
 * @param   {array}  cause Array of AJV validation objects
 * @returns {string}       Error message
 */
function buildValidationMessage(cause) {
    // For now, just handle first validation error
    const error = cause.length && cause[0];
    const instancePathArr = error.instancePath.split("/");

    // Get param name
    let param = instancePathArr.pop();
    // Check if param name is a number; if so, param is an array and up one in path
    const isArray = !isNaN(param);
    if (isArray) param = instancePathArr.pop();

    switch (error.keyword) {
        case "required":
            return ErrorMessage.paramRequiredErrMsg(error.params.missingProperty);
        case "type":
            if (isArray) {
                return ErrorMessage.invalidArrayItemsTypeErrMsg(param, error.params.type);
            } else {
                return ErrorMessage.invalidTypeErrMsg(param, error.params.type);
            }
        case "minLength":
            return ErrorMessage.minLengthErrMsg(param, error.params.limit);
        case "minItems":
            return ErrorMessage.arrayMinItemsErrMsg(param, error.params.limit);
        case "format":
            return ErrorMessage.invalidFormat(param, error.params.format);
        case "minimum":
            return `\`${param}\` ${error.message}`;
        case "errorMessage":
            return error.message;
        case "additionalProperties":
            // Iterate thru all causes and find all "additionalProperties" errors
            const additionalProperties = cause.reduce((arr, error) => {
                if (error.keyword === "additionalProperties")
                    arr.push(error.params.additionalProperty);
                return arr;
            }, []);
            return ErrorMessage.additionalPropertiesErrMsg(additionalProperties);
        default:
            return error.message;
    }
}
