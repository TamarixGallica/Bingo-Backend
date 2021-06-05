import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable("users", (table) => {
        table.increments();
        table.string("username").notNullable();
        table.string("name").notNullable();
        table.string("hash").notNullable();
        table.timestamps(true, true);
        table.unique(["username"]);
    });
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable("users");
}

