import { access } from 'fs/promises';
import dotenv from 'dotenv';
import { execaCommandSync } from 'execa';

/**
 * Jest setup function where we:
 * - Validate and load test env file (.env.test)
 * - Initialize migrate and reset of test database (targeted in .env.test)
 * 
 * @param {object} globalConfig  Jest global configuration
 */
export default async function setup(globalConfig) {
    const silent = globalConfig.silent || false;

    // Check for .env.test file - throw error if not present
    try {
        await access(`.env.test`);
    } catch (err) {
        console.error(err);
        throw new Error("Error loading env variables. Have you set up a `.env.test` file?")
    }

    // Load .env file for unit tests
    dotenv.config({ path: '.env.test' });

    // Synchronously run database migrations in child process w/ test env vars
    log("\nRunning database migrations ...");
    await execaCommandSync(`prisma db push --force-reset`)

    function log(msg) {
        if (!silent) console.info(msg);
    }
};