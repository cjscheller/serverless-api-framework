import { normalizeHttpResponse } from "@middy/util";

/**
 * Sets request headers to support CORS.
 */
export default {
    after: async (request) => {
        normalizeHttpResponse(request);
        const { headers } = request.response;
        const origin = request.event.headers.Origin ?? request.event.headers.origin;
        request.response.headers = setCorsHeaders(headers, origin);
    },
    onError: async (request) => {
        // Do not set CORS headers if response is not defined
        if (request.response === undefined) return;
        const { headers } = request.response;
        const origin = request.event.headers.Origin ?? request.event.headers.origin;
        request.response.headers = setCorsHeaders(headers, origin);
    },
};

/**
 * Modify response headers to provide CORS support to incoming requests (including preflight).
 *
 * In the future, we can permit CORS from other domains by maintaining
 * a list of CORS-approved routes (ex: widgets) and checking request
 * headers to validate if method and route are in CORS-approved list.
 * https://developer.mozilla.org/en-US/docs/Glossary/Preflight_request
 *
 * @param {Object}  headers             Response headers
 * @param {String}  requestOrigin       'Origin' specified in request header
 * @param {Boolean} isPreflightRequest  Indicates a preflight request (default: false)
 * @returns {Object} headers
 */
export function setCorsHeaders(headers, requestOrigin, isPreflightRequest = false) {
    // Define standard CORS headers for all requests
    headers["Access-Control-Allow-Origin"] = getAllowedOrigin(requestOrigin);
    headers["Access-Control-Allow-Credentials"] = "true";
    headers["Access-Control-Allow-Headers"] = "Content-Type";

    // Set additional headers only applicable to preflight requests
    if (isPreflightRequest) {
        // Cache preflight response for maximum time to minimize preflight requests
        headers["Access-Control-Max-Age"] = 86400;
        // Set 'Vary' header to indicate preflight response is dependent on "Origin" header
        headers["Vary"] = "Origin";
        // Set "Cache-Control" header to cache preflight response in any public proxy
        // that supports caching OPTIONS requests (not all do)
        headers["Cache-Control"] = "public, max-age=86400";
    }

    return headers;
}

/**
 * Define origin used for CORS 'Allow-Origin' header
 *  - References {} which is comma-separated string or allowed origins
 *  - If 1 allowed origin, return that origin
 *  - If >1 allowed origins, check request's origin and return origin
 *    that matches request origin; if no match, return the first origin
 *
 * @param {String} requestOrigin 'Origin' specified in request header
 * @returns {String} Origin for 'Allow-Origin' header
 */
function getAllowedOrigin(requestOrigin) {
    const allowedOrigins = process.env.CORS_ORIGINS || process.env.DASHBOARD_URL || "";
    const origins = allowedOrigins.split(",");

    // TODO: wildcard support?

    // Check if request's origin matches one of the permitted origins
    if (origins.length > 1 && origins.includes(requestOrigin)) {
        return requestOrigin;
    } else {
        return origins[0];
    }
}
