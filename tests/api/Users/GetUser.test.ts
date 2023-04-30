import handler from "../../../handlers/Users/GetUser/handler";
import { triggerApi } from "../../lib/events";
import { createUserAndCustomer, defaultExclude } from "../../../models/Users";
import ErrorTypes from "../../../lib/errorHandling/errorTypes";
import { resourceNotFound } from "../../../lib/errorHandling/errorMessages";
import { truncateAllTables } from "../../lib/db";
import { User } from "@prisma/client";

let user = {} as User;
beforeAll(async () => {
    const newUser = {
        firstName: "First",
        lastName: "Last",
        email: "test@test.com",
        password: "blah1234",
        apiKey: "12345",
    };
    user = await createUserAndCustomer(newUser, { name: "Testing 123" });
});

afterAll(truncateAllTables);

describe("GET /users/{id}", () => {
    test("throws 404 error | user does not exist", async () => {
        const id = "12385914123";
        const event = { pathParameters: { id } };
        const response = await triggerApi(handler, event);

        expect(response.statusCode).toEqual(404);
        const { body } = response;
        expect(body.type).toEqual(ErrorTypes.NOT_FOUND);
        expect(body.code).toEqual("USER_NOT_FOUND");
        expect(body.message).toEqual(resourceNotFound("User", id));
    });

    test("success 200 | pathParameter is a string", async () => {
        const event = { pathParameters: { id: String(user?.id) } };
        const response = await triggerApi(handler, event);

        expect(response.statusCode).toEqual(200);
        const { body } = response;
        expect(body.id).toEqual(user?.id);
        expect(body.firstName).toEqual(user?.firstName);
        expect(body.lastName).toEqual(user?.lastName);
        expect(body.email).toEqual(user?.email);

        // API should not return excluded database fields
        defaultExclude.forEach((exclude) => {
            expect(body[exclude]).not.toBeDefined();
        });
    });

    test("success 200 | pathParameter is an integer", async () => {
        const event = { pathParameters: { id: user?.id } };
        const response = await triggerApi(handler, event);

        expect(response.statusCode).toEqual(200);
        const { body } = response;
        expect(body.id).toEqual(user?.id);
        expect(body.firstName).toEqual(user?.firstName);
        expect(body.lastName).toEqual(user?.lastName);
        expect(body.email).toEqual(user?.email);

        // API should not return excluded database fields
        defaultExclude.forEach((exclude) => {
            expect(body[exclude]).not.toBeDefined();
        });
    });
});
