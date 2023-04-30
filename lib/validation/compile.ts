import { readFile, writeFile } from "fs/promises";
import glob from "glob";
import path from "path";

import Ajv from "ajv";
import addFormats from "ajv-formats";
import addErrors from "ajv-errors";
import standaloneCode from "ajv/dist/standalone/index.js";

const ajvOptions = {
    strict: true,
    allErrors: true,
    messages: true,
    coerceTypes: true,
    code: {
        source: true, // required for generating schema as code/function
        esm: true, // generate/export ESM file (default is CJS)
    },
};

const ajv = new Ajv(ajvOptions);
addFormats(ajv);
addErrors(ajv);

// Find all JSON validation schema files in target directory
glob("handlers/*/*/schema.*.json", async (err, files) => {
    await Promise.all(files.map(compileJsonSchema));
});

// Read JSON Schema file, compile via AJV, and output to same directory
async function compileJsonSchema(file) {
    try {
        // Get parent directory path from file
        const parentDir = path.dirname(file);

        // Read schema file
        const schema = await readFile(file, "utf8");

        // Compile schema via AJV
        const compiled = ajv.compile(JSON.parse(schema));

        // Build output module file content via AJV's standalone
        let moduleCode = standaloneCode(ajv, compiled);

        // ajv@8.12 bug: Replace "require" statement with "import" statement for ucs2length library
        codeReplacements.forEach((replacement) => {
            moduleCode = moduleCode.replace(replacement.target, replacement.replaceStr);
        });
        // const targetRegex = /const func2 = require\("ajv\/dist\/runtime\/ucs2length"\)\.default;/;
        // const replaceStr = `import ucs2length from "ajv/dist/runtime/ucs2length.js"; const func2 = ucs2length.default; `;
        // moduleCode = moduleCode.replace(targetRegex, replaceStr);

        // // ajv@8.12 bug: Replace "require" statement with "import" statement for ajv-formats library
        // const targetRegexV2 =
        //     /const formats6 = require\("ajv-formats\/dist\/formats"\)\.fullFormats\.date;/;
        // const replaceStrV2 = `import formats from "ajv-formats/dist/formats.js"; const formats6 = formats.fullFormats.date; `;
        // moduleCode = moduleCode.replace(targetRegexV2, replaceStrV2);

        // Append comment to start of module code
        const comment = `// This file was auto-generated via AJV validation (see "yarn ajv:compile")\n`;
        moduleCode = comment + moduleCode;

        // Write file to parent directory of source file
        await writeFile(path.join(parentDir, "schema.js"), moduleCode, "utf-8");

        console.log(`Successfully compiled ${file}`);
    } catch (err) {
        console.error(`Error compiling ${file}`, err);
    }
}

const codeReplacements = [
    {
        target: /const func2 = require\("ajv\/dist\/runtime\/ucs2length"\)\.default;/,
        replaceStr: `import ucs2length from "ajv/dist/runtime/ucs2length.js"; const func2 = ucs2length.default || ucs2length; `,
    },
    {
        target: /const formats6 = require\("ajv-formats\/dist\/formats"\)\.fullFormats\.date;/,
        replaceStr: `import { fullFormats as formats } from "ajv-formats/dist/formats.js"; const formats6 = formats.date; `,
    },
    {
        target: /const formats4 = require\("ajv-formats\/dist\/formats"\)\.fullFormats\.date;/,
        replaceStr: `import { fullFormats as formats } from "ajv-formats/dist/formats.js"; const formats4 = formats.date; `,
    },
];
