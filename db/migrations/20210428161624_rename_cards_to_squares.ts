import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.renameTable("cards", "squares");
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.renameTable("squares", "cards");
}

