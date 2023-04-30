import baseHandler from "../../lib/wrappers/baseHandler.js";

const handler = async (event) => {
    return {
        statusCode: 200,
        body: {
            success: true,
            message: "Welcome to the API!",
        },
    };
};

export default baseHandler(handler);
