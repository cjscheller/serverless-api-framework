import { ValidationError } from "ajv";

type ValidationOptions = {
    eventSchema?: any;
    responseSchema?: any;
};

/**
 * Middleware that validates incoming events (eventSchema) and outgoing
 * responses (responseSchema) against custom JSON schemas using AJV
 *
 * @param  {Function} opts.eventSchema Compiled validation function from JSON schema for request event
 * @param  {Function} opts.responseSchema Compiled validation function from JSON schema for response
 * @returns Throws error on validation error; else void
 */
export default function validatonMiddleware(opts: ValidationOptions) {
    const { eventSchema, responseSchema } = { ...opts };

    // Validate request's event schema in "before" middleware flow
    const validatorMiddlewareBefore = async (request) => {
        if (eventSchema) {
            if (!eventSchema(request.event)) {
                throw new ValidationError(eventSchema.errors);
            }
        }
    };

    // Validate response schema in "after" middleware flow
    const validatorMiddlewareAfter = async (request) => {
        if (!responseSchema(request.response)) {
            throw new ValidationError(responseSchema.errors);
        }
    };
    return {
        before: eventSchema ? validatorMiddlewareBefore : undefined,
        after: responseSchema ? validatorMiddlewareAfter : undefined,
    };
}
