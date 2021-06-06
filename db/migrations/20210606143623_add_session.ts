import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable("sessions", (table) => {
        table.increments();
        table.integer("user_id").references("users.id").unsigned().index().onDelete("CASCADE");
        table.string("token").notNullable();
        table.timestamps(true, true);
        table.unique(["token"]);
    });
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable("sessions");
}

