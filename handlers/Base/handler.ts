import baseHandler from "../../lib/wrappers/baseHandler.js";

const handler = async (event) => {
    const links = [
        {
            rel: "docs",
            href: "",
        },
    ];

    return {
        statusCode: 200,
        body: links,
    };
};

export default baseHandler(handler);
