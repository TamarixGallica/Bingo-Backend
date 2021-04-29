import { Knex } from "knex";
import dotenv from "dotenv";
import { Theme } from "../../src/models";

const themeTable = "themes";

export const themeEntries: Theme[] = [
    { id: 1, name: "Contains 'the'" },
    { id: 2, name: "Refers to numbers"},
    { id: 4, name: "Improved"}
];

export async function seed(knex: Knex): Promise<void> {
    dotenv.config();

    // Deletes ALL existing entries
    await knex(themeTable).del();

    // Inserts seed entries
    await knex(themeTable).insert(themeEntries);    
}