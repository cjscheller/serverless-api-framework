import prisma from "../../models/Prisma";

/**
 * Clear database by truncating all tables
 *
 * Note: truncate is more efficient than prisma.deleteMany, which requires
 * two querys (1 list, 1 delete) and does not reset auto-increment
 */
export async function truncateAllTables() {
    await prisma.$executeRaw`TRUNCATE table User`;
}
