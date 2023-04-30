import { jsonSafeParse, normalizeHttpResponse } from "@middy/util";
import { ValidationError } from "ajv";
import { httpResponseSerializer } from "./httpResponseSerializer.js";

// Error message to display when unknown error occurs
const FALLBACK_MESSAGE = "An unexpected error occurred.";

/**
 * Middleware to handle errors and build well-formed HTTP response.
 * Sourced from @middy/http-error-handler, with the following modifications:
 *  - If error type is AJV ValidationError, do not handle
 *    and let validationError middleware handle response
 */
export default {
    onError: async (request) => {
        // If response already defined, do not overwrite it
        if (request.response !== undefined) return;

        // If error is AJV ValidationError, do not handle in this error handler
        if (request.error instanceof ValidationError) return;

        // Log request errors when not in TEST environment
        if (process.env.NODE_ENV != "test") {
            console.error(request.error);
        }

        // Set default expose value, only passes in when there is an override
        if (request.error.statusCode && request.error.expose === undefined) {
            request.error.expose = request.error.statusCode < 500;
        }

        // Non-http error OR expose set to false
        if (!request.error.statusCode || !request.error.expose) {
            request.error = {
                statusCode: 500,
                message: FALLBACK_MESSAGE,
                expose: true,
            };
        }

        // Handle HTTP errors thrown from the application
        if (request.error.expose) {
            normalizeHttpResponse(request);
            const { statusCode, message, headers } = request.error;

            // body will either be object (if valid JSON) or string (if not valid JSON)
            const body = jsonSafeParse(message);

            request.response = {
                ...request.response,
                statusCode,
                body,
                headers: {
                    ...headers,
                    ...request.response.headers,
                },
            };

            // If response body is JSON-able, serialize response to JSON
            if (typeof body === "object") {
                httpResponseSerializer(request);
            }
            // If response body is string, set Content-Type to plain text
            else {
                request.response.headers["Content-Type"] = "text/plain";
            }
        }
    },
};
