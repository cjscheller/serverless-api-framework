/**
 * When cookie is specified in response, sets cookie in "Set-Cookie" header
 */
export default {
    after: (request) => {
        // Set cookie in header
        if (request.response.cookie) {
            request.response.headers["Set-Cookie"] = request.response.cookie;
        }
    },
};
