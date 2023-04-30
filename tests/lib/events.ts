import createEvent from "@serverless/event-mocks";

interface LambdaEvent {
    body?: object;
    headers?: object;
    pathParameters?: object;
}

/**
 * Creates an API Gateway event with specified event properties and
 * uses event to simulate API call/event to Lambda handler function
 *
 * Note: if necessary, we could serialize API response to specified
 * Content-Type here before returning value (ie JSON.parse(body))
 *
 * @param   {function}  handler Lambda handler function
 * @param   {object}    event   Lambda event object, including body, headers, pathParameters
 * @returns {Promise}
 */
export async function triggerApi(handler, event: LambdaEvent = {}) {
    const apiEvent = createEvent("aws:apiGateway", event);

    try {
        return await handler(apiEvent, apiEvent.requestContext);
    } catch (err) {
        // Simulate http-error-handler
        return {
            statusCode: err.statusCode,
            body: err.body && JSON.parse(err.body),
        };
    }
}
