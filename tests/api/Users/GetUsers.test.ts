import handler from "../../../handlers/Users/GetUsers/handler";
import { triggerApi } from "../../lib/events";
import { createUser, defaultExclude } from "../../../models/Users";
import { createCustomer } from "../../../models/Customers";
import { Customer } from "@prisma/client";

describe("GET /users", () => {
    test("success 200 | empty list", async () => {
        const response = await triggerApi(handler);

        expect(response.statusCode).toEqual(200);
        const { body } = response;
        expect(body.length).toEqual(0);
    });

    test("success 200 | multiple users", async () => {
        const customer = await createCustomer({ name: "Customer w/ User List " });

        const sampleUser = {
            firstName: "First",
            lastName: "Last",
            password: "blah1234",
            apiKey: "12345",
        };

        await createUser({ ...sampleUser, email: "test1@test.com" }, customer?.id);
        await createUser({ ...sampleUser, email: "test2@test.com" }, customer?.id);
        await createUser({ ...sampleUser, email: "test3@test.com" }, customer?.id);
        const response = await triggerApi(handler);

        expect(response.statusCode).toEqual(200);
        const { body } = response;
        expect(body.length).toEqual(3);

        // API should not return excluded database fields
        defaultExclude.forEach((exclude) => {
            expect(body[0][exclude]).not.toBeDefined();
        });
    });
});
