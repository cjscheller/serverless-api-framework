import inquirer from "inquirer";
import Mustache from "mustache";
import { mkdir, readFile, writeFile, appendFile } from "node:fs/promises";

interface CreateRouteOptions {
    name: string;
    method: string; // enum GET, POST, PATCH, etc
    path: string;
    validation: boolean;
}

const createRouteQuestions = [
    {
        name: "name",
        type: "input",
        message: "Route Name (ie Users/CreateUser)",
    },
    {
        name: "method",
        type: "list",
        message: "Method",
        choices: ["GET", "POST", "PATCH", "PUT", "DELETE", "HEAD", "OPTIONS"],
    },
    {
        name: "path",
        type: "input",
        message: "Path",
        validate: (answer) => {
            // Validate path starts with '/'
            return new Promise((resolve, reject) => {
                resolve(answer[0] === "/" ? true : false);
            });
        },
    },
    {
        name: "validation",
        type: "confirm",
        message: "Requires validation",
    },
];

/**
 * Creates a new API route per options provided
 *
 * @param {CreateRouteOptions} options
 * @returns {void}
 */
async function createRoute(options: CreateRouteOptions) {
    try {
        // Create new folder using route name
        const routeFolder = `${process.cwd()}/handlers/${options.name}`;
        await mkdir(routeFolder, { recursive: true });
        console.log(`Created new directory: ${routeFolder}`);

        // Create handler file in new route folder
        await createHandlerFile(routeFolder, options.validation);

        // Create Lambda resource file in new route folder
        await createLambdaFile(routeFolder, options);

        // Append new Lambda resource path to Lambda import file
        await appendLambdaResource(options.name);

        // If new route requires validation, stub JSON schema file and compiled.js file
        if (options.validation) {
            // Create schema.json file for AJV validation
            await writeFile(`${routeFolder}/schema.event.json`, "{}");

            // Create (empty) schema file for compiled AJV validation
            const schemaComment = "// Compiled AJV validation (see yarn ajv:compile)";
            await writeFile(`${routeFolder}/schema.js`, schemaComment);
        }
    } catch (err) {
        console.error(err);
    }
}

// Prompt user for questions and pass answers into create rout function
inquirer.prompt(createRouteQuestions).then(createRoute).catch(console.error);

/*** Helper functions ***/

/**
 * Create sample handler.js file from template for new route
 *
 * @param {string}  routeFolder
 * @param {boolean} validation
 * @returns {void}
 */
async function createHandlerFile(routeFolder: string, validation: boolean) {
    // Generate templated handler file
    const template = `${process.cwd()}/lib/templates/route/handler.txt`;
    const output = await generateTemplateFile(template, { validation });

    // Create new file
    await writeFile(`${routeFolder}/handler.js`, output);
    console.log(`Created new file: handler.ts`);
}

/**
 * Create lambda.yml file from template for new route
 *
 * @param {string}             routeFolder
 * @param {CreateRouteOptions} options
 * @returns {void}
 */
async function createLambdaFile(routeFolder: string, options: CreateRouteOptions) {
    // Get name for Lambda resource - everything after last /
    const lambdaName = options.name.split("/").pop();

    // Generate templated handler file
    const template = `${process.cwd()}/lib/templates/route/lambda.txt`;
    const output = await generateTemplateFile(template, { ...options, name: lambdaName });

    // Create new file
    await writeFile(`${routeFolder}/lambda.yml`, output);
    console.log(`Created new file: lambda.yml`);
}

/**
 * Reads a template at $path, renders template with template data,
 * and returns output.
 *
 * @param {string} path Path to template file
 * @param {object} data Template data to be used during render
 * @returns {string} Mustache-rendered tempalte
 */
async function generateTemplateFile(path: string, data: object) {
    // Read file
    const template = await readFile(path, "utf-8");

    // Render and return template using Mustache
    return Mustache.render(template, data);
}

/**
 * Appends a new Lambda resource file to primary Lambda import file
 * so that new Lambda for route can be included in deployments
 *
 * @param {string} name Directory name/path
 * @returns {void}
 */
async function appendLambdaResource(name: string) {
    const lambdaResourceFile = `${process.cwd()}/resources/lambda.yml`;
    await appendFile(lambdaResourceFile, `- \${file(handlers/${name}/lambda.yml)}\n`);
    console.log(`Append Lambda resource`);
}
