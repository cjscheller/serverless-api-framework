import { SignJWT, jwtVerify, JWTPayload } from "jose";
import { serialize } from "cookie";

const JWT_EXPIRATION = 86400; // 1 day (secs)
export const AUTH_COOKIE_NAME = "SESSION";

/**
 * A utility class that implements JSON Web Token (JWT) functionality.
 */
export default class JWT {
    private secret: string | undefined = process.env.JWT_PRIVATE_KEY;
    private payload: JWTPayload | undefined;
    token: string;

    /**
     * Constructor. Either pass in an existing unencoded token or nothing to build a new, empty JWT object
     *
     * @constructor
     * @param {string} token Optional token to construct the JWT object with.
     */
    constructor(token = null) {
        if (token) {
            this.token = token;
        }
    }

    /**
     * Sign a token
     *
     * @param {string} payload The payload for signing the token with.
     */
    async sign(payload) {
        this.payload = payload;
        this.token = await new SignJWT(payload)
            .setProtectedHeader({ alg: "HS256" })
            .setIssuedAt()
            .setExpirationTime("1d") // Expires after 1 day
            // .setAudience(this.#audience)
            // .setIssuer(this.#issuer)
            .sign(new TextEncoder().encode(this.secret));
    }

    /**
     * Serializes the JWT token into a cookie
     *
     * @param {string} cookieName Name of cookie
     */
    serializeCookie(cookieName = AUTH_COOKIE_NAME) {
        return serialize(cookieName, this.token, {
            maxAge: JWT_EXPIRATION, // Cookie and JWT have same expiration
            httpOnly: true,
            secure: process.env.NODE_ENV === "development" ? false : true,
            // https://web.dev/samesite-cookies-explained/
            sameSite: "strict",
            path: "/",
        });
    }

    /**
     * Clears a JWT token by deleting the cookie holding it
     * @param {object} res The Express response object used to remove the cookie
     */
    static remove(cookieName = AUTH_COOKIE_NAME) {
        // Delete cookie by setting value to empty string, expiration in past
        return serialize(cookieName, "", {
            expires: new Date(0),
            path: "/",
        });
    }

    /**
     * Verifies the JWT token
     */
    async verify() {
        const { payload } = await jwtVerify(this.token, new TextEncoder().encode(this.secret), {
            // audience: this.audience,
            // issuer: this.issuer,
        });
        this.payload = payload;
        return payload;
    }

    /**
     * Wraps this.verify in a Promise
     */
    async verifyPs() {
        return new Promise((resolve, reject) => {
            try {
                resolve(this.verify());
            } catch {
                reject();
            }
        });
    }

    /**
     * Get the JWT token
     */
    getToken() {
        return this.token;
    }

    /*** Note: the following functions have not been tested with `jose` library ***/

    /**
     * Updates the JWT payload
     * @param {object} payload The payload object to update the JWT with
     */
    update(payload) {
        // Delete 'exp' (expiration) property before siging so can be renewed
        if ("exp" in payload) delete payload.exp;
        this.sign(payload);
    }

    /**
     * Get the JWT payload
     */
    getPayload() {
        return this.payload || "";
    }

    // /**
    //  * Returns the number of minutes until the JWT expires.
    //  */
    // minsUntilExpiry() {
    //     const now = new Date();
    //     const expiryDate = new Date(this.payload.exp * 1000); //Javascript date object constructor requires milliseconds
    //     const diff = new Date(expiryDate.getTime() - now.getTime());
    //     return diff.getMinutes();
    // }
}
