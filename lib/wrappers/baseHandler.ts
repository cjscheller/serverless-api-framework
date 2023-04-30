import middy from "@middy/core";
import cors from "../middleware/cors.js";
import validator from "../middleware/validation.js";
import validationError from "../middleware/validationError.js";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import httpErrorHandler from "../middleware/httpErrorHandler.js";
import httpEventNormalizer from "../middleware/httpEventNormalizer.js";
import httpResponseSerializer from "../middleware/httpResponseSerializer.js";

interface MiddlewareObject {
    before?: (any) => void;
    after?: (any) => void;
    onError?: (any) => void;
}

interface HandlerOptions {
    middleware?: MiddlewareObject[];
    eventSchema?: any;
    responseSchema?: any;
}

/**
 * Basic middleware wrapper for handler functions, including standard middlware
 * used for most handlers as well as additional configurable middleware
 * provided via options.middleware
 *
 * @param {function}       handler  Handler function
 * @param {HandlerOptions} options  Handler options, including extra middleware and AJV schemas
 */
export default function baseHandler(handler, options: HandlerOptions = {}) {
    return middy(handler)
        .use(httpJsonBodyParser()) // Serialize event body to JSON
        .use(httpEventNormalizer) // Normalize AWS event request objects
        .use(cors) // Handle CORS requests/headers
        .use(validationHandler(options.eventSchema, options.responseSchema))
        .use(options.middleware || [])
        .use(httpResponseSerializer) // Serialize response to JSON
        .use(httpErrorHandler); // Handles and returns well-formed HTTP errors
}

/**
 * Basic middleware wrapper for validation, returning validation middleware
 * instantiated with provided schemas and validation error middleware.
 * If no validation schemas provided, does not add validation middleware.
 *
 * @param {object} eventSchema     AJV validation schema for request event
 * @param {object} responseSchema  AJV validation schema for response
 */
function validationHandler(eventSchema: any = undefined, responseSchema: any = undefined) {
    if (eventSchema || responseSchema) {
        return [validator({ eventSchema, responseSchema }), validationError];
    } else {
        return [];
    }
}
