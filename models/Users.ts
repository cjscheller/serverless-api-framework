// This is a sample model for a User resource extending Prisma functionality

import prisma from "./Prisma.js";
import { User, Prisma } from "@prisma/client";

// Define default fields to select from db
const defaultSelect = {
    id: true,
    firstName: true,
    lastName: true,
    email: true,
    customerId: true,
    role: true,
} satisfies Prisma.UserSelect;

// Infer the User payload type with selected fields
type UserPayload = Prisma.UserGetPayload<{ select: typeof defaultSelect }>;

// Define define fields to exclude from queries
export const defaultExclude = ["password", "apiKey", "customer", "createdAt", "updatedAt"];

/**
 * Get all users
 *
 * @returns {[UserPayload]}
 */
export async function listUsers(): Promise<UserPayload[]> {
    return await prisma.user.findMany({ select: defaultSelect });
}

/**
 * Get user
 *
 * @param  {number} userId
 * @param  {object} query   Prisma query options
 * @return {User}
 */
export async function getUser(userId: number, query: any = {}): Promise<User | null> {
    return await prisma.user.findUnique({
        where: { id: userId },
        select: query.select || defaultSelect,
        ...query,
    });
}

/**
 * Get user by unique email
 *
 * @param  {string} email
 * @param  {object} query   Prisma query options
 * @return {User}
 */
export async function getUserByEmail(email: string, query: any = {}): Promise<User | null> {
    return await prisma.user.findUnique({
        where: { email },
        select: query.select || defaultSelect,
        ...query,
    });
}

/**
 * Create new user associated with existing customer
 *
 * @param  {User}    data
 * @param  {number}  customerId   ID of existing customer to associate user with
 * @return {User}
 */
export async function createUser(
    data: Prisma.UserCreateWithoutCustomerInput,
    customerId: number
): Promise<User> {
    // Hash password via bcrypt
    const hashedPassword = data.password;

    const user = await prisma.user.create({
        data: {
            ...data,
            password: hashedPassword,
            // apiKey: generateApiKey(),
            customer: {
                connect: {
                    id: customerId,
                },
            },
        },
    });
    return exclude(user, defaultExclude);
}

/**
 * Update user
 *
 * @param  {number} userId
 * @param  {User}   data
 * @return {UserPayload}
 */
export async function updateUser(userId: number, data: User): Promise<UserPayload> {
    return await prisma.user.update({
        where: { id: userId },
        data,
        select: defaultSelect,
    });
}

/**
 * Delete user
 *
 * @param  {number} userId
 * @return {UserPayload}
 */
export async function deleteUser(userId: number): Promise<UserPayload> {
    return await prisma.user.delete({
        where: { id: userId },
        select: defaultSelect,
    });
}

/**
 * Exclude keys from user result
 *  Source: https://www.prisma.io/docs/concepts/components/prisma-client/excluding-fields
 *
 * @param   {User}          user
 * @param   {Array<string>} keys keys to remove from User object
 * @returns {User}          modified user object
 */
function exclude(user: User, keys: string[]) {
    for (let key of keys) {
        delete user[key];
    }
    return user;
}
