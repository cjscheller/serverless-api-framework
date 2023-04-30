import JWT, { AUTH_COOKIE_NAME } from "../auth/JWT.js";
import { parse } from "cookie";
import { Unauthorized } from "../errorHandling/httpErrors.js";

/**
 * Checks if request has valid authentication via JWT in session cookie.
 * If cookie does not exist or is invalid, throws 401 Unauthorized
 */
export default {
    before: async (request) => {
        // Check for session cookie
        const cookies = parse(request.event.headers.cookie || "");
        const authCookie = cookies[AUTH_COOKIE_NAME];

        try {
            // If cookie not set, 401 Unauthorized
            if (!authCookie) throw "";

            // Verify JWT return token payload and
            const token = new JWT(authCookie);
            const payload = await token.verify();

            // Set authenticated session object in event context
            request.event.context = { session: payload };
        } catch (err) {
            console.error(err);
            throw Unauthorized();
        }
    },
};
