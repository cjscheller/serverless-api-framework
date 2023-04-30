import handler from "../../../handlers/Users/UpdateUser/handler";
import { triggerApi } from "../../lib/events";
import { getUser, createUserAndCustomer } from "../../../models/Users";
import ErrorTypes from "../../../lib/errorHandling/errorTypes";
import * as ErrorMessages from "../../../lib/errorHandling/errorMessages";
import { truncateAllTables } from "../../lib/db";
import { User } from "@prisma/client";

afterAll(truncateAllTables);

describe("PATCH /users/{id}", () => {
    test("throws 404 error | attempt to update non-existing user", async () => {
        const id = "1839252354";
        const event = {
            pathParameters: { id },
            body: {
                firstName: "New User Name",
            },
        };
        const response = await triggerApi(handler, event);

        expect(response.statusCode).toEqual(404);
        const { body } = response;
        expect(body.type).toEqual(ErrorTypes.NOT_FOUND);
        expect(body.code).toEqual("USER_NOT_FOUND");
        expect(body.message).toEqual(ErrorMessages.resourceNotFound("User", id));
    });

    test("throws 400 error | invalid type for firstName", async () => {
        const event = {
            body: {
                firstName: {},
            },
        };

        const response = await triggerApi(handler, event);

        expect(response.statusCode).toEqual(400);
        expect(response.body.type).toEqual(ErrorTypes.VALIDATION_ERROR);
        expect(response.body.message).toEqual(
            ErrorMessages.invalidTypeErrMsg("firstName", "string")
        );
    });

    test("throws 400 error | invalid type for lastName", async () => {
        const event = {
            body: {
                lastName: {},
            },
        };

        const response = await triggerApi(handler, event);

        expect(response.statusCode).toEqual(400);
        expect(response.body.type).toEqual(ErrorTypes.VALIDATION_ERROR);
        expect(response.body.message).toEqual(
            ErrorMessages.invalidTypeErrMsg("lastName", "string")
        );
    });

    test("throws 400 error | firstName is empty string", async () => {
        const event = {
            body: {
                firstName: "",
            },
        };

        const response = await triggerApi(handler, event);

        expect(response.statusCode).toEqual(400);
        expect(response.body.type).toEqual(ErrorTypes.VALIDATION_ERROR);
        expect(response.body.message).toEqual(ErrorMessages.minLengthErrMsg("firstName", 1));
    });

    test("throws 400 error | invalid format for email | no @", async () => {
        const event = {
            body: {
                email: "blah",
            },
        };
        const response = await triggerApi(handler, event);

        expect(response.statusCode).toEqual(400);
        expect(response.body.type).toEqual(ErrorTypes.VALIDATION_ERROR);
        expect(response.body.message).toEqual(ErrorMessages.invalidFormat("email", "email"));
    });

    test("throws 400 error | invalid format for email | no TLD (.com)", async () => {
        const event = {
            body: {
                email: "blah@blah",
            },
        };
        const response = await triggerApi(handler, event);

        expect(response.statusCode).toEqual(400);
        expect(response.body.type).toEqual(ErrorTypes.VALIDATION_ERROR);
        expect(response.body.message).toEqual(ErrorMessages.invalidFormat("email", "email"));
    });

    test("throws 400 error | invalid format for email | empthy", async () => {
        const event = {
            body: {
                email: "",
            },
        };
        const response = await triggerApi(handler, event);

        expect(response.statusCode).toEqual(400);
        expect(response.body.type).toEqual(ErrorTypes.VALIDATION_ERROR);
        expect(response.body.message).toEqual(ErrorMessages.invalidFormat("email", "email"));
    });

    test("throws 400 error | additional parameters specified", async () => {
        const additional = ["price", "description"];
        const event = {
            body: {
                price: 10.99,
                description: "Blah blah blah",
            },
        };

        const response = await triggerApi(handler, event);

        expect(response.statusCode).toEqual(400);
        expect(response.body.type).toEqual(ErrorTypes.VALIDATION_ERROR);
        expect(response.body.message).toEqual(ErrorMessages.additionalPropertiesErrMsg(additional));
    });

    test("success 200 | update user", async () => {
        const newUser = {
            firstName: "First",
            lastName: "Last",
            email: "blah@blah.com",
            apiKey: "blah",
            password: "blah",
        };
        const user = await createUserAndCustomer(newUser, { name: "Customer for Updated User" });

        const updates = {
            firstName: "New First",
            lastName: "New Last",
            email: "new@blah.com",
        };

        const event = {
            pathParameters: { id: user.id },
            body: updates,
        };

        const response = await triggerApi(handler, event);

        expect(response.statusCode).toEqual(200);

        // Validate response body
        const { body } = response;
        expect(body.firstName).toEqual(updates.firstName);
        expect(body.lastName).toEqual(updates.lastName);
        expect(body.email).toEqual(updates.email);

        // Validate record in DB
        const updatedUser = await getUser(body.id);
        expect(updatedUser?.firstName).toEqual(updates.firstName);
        expect(updatedUser?.lastName).toEqual(updates.lastName);
        expect(updatedUser?.email).toEqual(updates.email);
    });
});
