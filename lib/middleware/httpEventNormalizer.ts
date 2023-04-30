/**
 * Normalizes incoming AWS event. By default, some event attributes are
 * undefined if not set by request. This instead sets an empty object
 *
 * Inspiration: https://middy.js.org/docs/middlewares/http-event-normalizer
 */
export default {
    before: (request) => {
        // If unset, set pathParameters to empty object
        if (!request.event.pathParameters) {
            request.event.pathParameters = {};
        }

        // If unset, set queryStringParameters to empty object
        if (!request.event.queryStringParameters) {
            request.event.queryStringParameters = {};
        }
    },
};
