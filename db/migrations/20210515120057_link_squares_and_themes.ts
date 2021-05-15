import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable("squares_themes", (table) => {
        table.increments();
        table.integer("square_id").references("squares.id").unsigned().index().onDelete("CASCADE");
        table.integer("theme_id").references("themes.id").unsigned().index().onDelete("CASCADE");
    });
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable("squares_themes");
}

