import type { JestConfigWithTsJest } from "ts-jest";

const config: JestConfigWithTsJest = {
    // preset: "ts-jest",
    preset: "ts-jest/presets/js-with-ts-esm",
    extensionsToTreatAsEsm: [".ts"],
    globalSetup: "./tests/lib/setup.js",
    // Allow Jest to read .js files as .ts
    moduleNameMapper: {
        "^(\\.{1,2}/.*)\\.js$": "$1",
    },
    // Manually transform ignored dependency to TS
    transform: {
        "node_modules/crypto-random-string/.+\\.(j|t)sx?$": "ts-jest",
        "handlers/*/*/schema.js": "ts-jest",
    },
    transformIgnorePatterns: ["node_modules/(?!crypto-random-string/.*)", "handlers/*/*/schema.js"],
};

export default config;
