/**
 * Serialize HTTP response. By default, we'll serialize all responses
 * into JSON and add appropriate Content-Type header.
 *
 * There are a few scenarios where API will return plain-text response:
 *  - 422 Unprocessable Entity - when malformed JSON is provided
 *  - 500 Internal Service Error - when an unexpected error occurs
 * Both of these scenarios are handled by error middleware and do not
 * get serialized by this middleware ("after" middleware are skipped on error)
 *
 * In the future we can introduce the ability to serialize into something
 * other than JSON, possibly by specifying a value like request.context.contentType
 */
export function httpResponseSerializer(request) {
    // Do not attempt to serialize response if not established
    if (!request.response) return;

    // Normalize header array if undefined
    if (!("headers" in request.response)) request.response.headers = [];

    // If Content-Type header already specified, do not serialize response
    if ("Content-Type" in request.response.headers || "content-type" in request.response.headers) {
        return;
    }

    // For now, we always serialize response to JSON
    request.response.headers["Content-Type"] = "application/json";

    // We have to stringify all JSON responses for Lambdas
    // We do not need to do this when running Jest unit test suite
    if (typeof request.response.body !== "string" && process.env.NODE_ENV != "test") {
        request.response.body = JSON.stringify(request.response.body);
    }
}

export default {
    after: httpResponseSerializer,
};
