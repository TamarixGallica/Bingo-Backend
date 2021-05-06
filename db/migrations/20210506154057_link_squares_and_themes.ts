import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable("squares_themes", (table) => {
        table.bigIncrements();
        table.bigInteger("square_id").references("squares.id").unsigned().index().onDelete("CASCADE");
        table.bigInteger("theme_id").references("themes.id").unsigned().index().onDelete("CASCADE");
    });
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable("squares_themes");
}

