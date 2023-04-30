import handler from "../../../handlers/Users/DeleteUser/handler";
import { triggerApi } from "../../lib/events";
import { createUserAndCustomer, getUser } from "../../../models/Users";
import ErrorTypes from "../../../lib/errorHandling/errorTypes";
import { resourceNotFound } from "../../../lib/errorHandling/errorMessages";
import { truncateAllTables } from "../../lib/db";

afterAll(truncateAllTables);

describe("DELETE /users/{id}", () => {
    test("throws 404 error | attempt to delete non-existing user", async () => {
        const id = "183903044";
        const event = { pathParameters: { id } };
        const response = await triggerApi(handler, event);

        expect(response.statusCode).toEqual(404);
        const { body } = response;
        expect(body.type).toEqual(ErrorTypes.NOT_FOUND);
        expect(body.code).toEqual("USER_NOT_FOUND");
        expect(body.message).toEqual(resourceNotFound("User", id));
    });

    test("success 200 | successfully delete user", async () => {
        const newUser = {
            firstName: "First",
            lastName: "Last",
            password: "blah1234",
            email: "delete@test.com",
            apiKey: "12345",
        };
        const user = await createUserAndCustomer(newUser, { name: "Customer w/ Deleted User" });

        const event = { pathParameters: { id: user.id } };
        const response = await triggerApi(handler, event);

        expect(response.statusCode).toEqual(204);
        const deletedUser = await getUser(user.id);
        expect(deletedUser).toBeFalsy();
    });
});
