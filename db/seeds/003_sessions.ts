import { Knex } from "knex";
import dotenv from "dotenv";

const sessionsTable = "sessions";

export async function seed(knex: Knex): Promise<void> {
    dotenv.config();

    // Delete existing sessions
    await knex(sessionsTable).del();
}
