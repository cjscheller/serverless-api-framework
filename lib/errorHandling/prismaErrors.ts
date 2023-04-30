import { Prisma } from "@prisma/client";

export enum PrismaErrorCode {
    NotFound = "P2025",
    NotUnique = "P2002",
}

/**
 * Check if Error is instance of Prisma client error (PrismaClientKnownRequestError)
 * If code is provided, also checks whether code matches Prisma error code
 *
 * TS note: err should be Error but throws TS error on `err.code`
 *
 * @param {Error}            err  Intercepted error object
 * @param {PrismaErrorCode?} code Prisma error code (optional)
 * @returns {boolean}
 */
export function isPrismaError(err: any, code: PrismaErrorCode | null = null): boolean {
    const isPrismaError = err instanceof Prisma.PrismaClientKnownRequestError;
    if (code) {
        return code === err.code;
    } else {
        return isPrismaError;
    }
}

/**
 * Check if Error is instance of Prisma unkown client request error
 * Thrown in the following identified situations (there are likely more):
 *  - When a required relation is empty/null (ex: order tries to fetch non-existent customer)
 *
 * TS note: err should be Error but throws TS error on `err.code`
 *
 * @param {Error}            err  Intercepted error object
 * @returns {boolean}
 */
export function isPrismaUnknownError(err: Error) {
    return err instanceof Prisma.PrismaClientUnknownRequestError;
}
