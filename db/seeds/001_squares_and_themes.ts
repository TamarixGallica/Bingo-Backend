import { Knex } from "knex";
import dotenv from "dotenv";
import { Square } from "../../src/models";
import { Theme } from "../../src/models";

const squareTable = "squares";
const themeTable = "themes";
const squaresThemesTable = "squares_themes";

export const themeEntries: Theme[] = [
    { id: 1, name: "Contains 'the'" },
    { id: 2, name: "Refers to numbers" },
    { id: 4, name: "Improved" }
];

export const squareEntries: Square[] = [
    { id: 1, text: "The first one", themes: [themeEntries[0], themeEntries[1]] },
    { id: 2, text: "The improved edition", themes: [themeEntries[0], themeEntries[2]] },
    { id: 3, text: "About to lose count", themes: [] },
    { id: 27, text: "The number 27", themes: [themeEntries[0], themeEntries[1]] }
];

export async function seed(knex: Knex): Promise<void> {
    dotenv.config();

    // Deletes ALL existing entries
    await knex(squaresThemesTable).del();
    await knex(squareTable).del();
    await knex(themeTable).del();

    // Inserts seed entries
    await knex(themeTable).insert(themeEntries);

    const squaresToAdd: Omit<Square, "themes">[] = squareEntries.map((square) => { return { id: square.id, text: square.text }; });
    await knex(squareTable).insert(squaresToAdd);

    const squaresThemesLinksToAdd = [];
    squareEntries.forEach((square) => {
        square.themes.forEach((theme) => {
            squaresThemesLinksToAdd.push({ square_id: square.id, theme_id: theme.id});
        });
    });

    await knex(squaresThemesTable).insert(squaresThemesLinksToAdd);

    // Update auto increment counters manually because ids were specified on insert
    await knex.raw("select setval('squares_id_seq', max(id)) from squares");
    await knex.raw("select setval('themes_id_seq', max(id)) from themes");
    await knex.raw("select setval('squares_themes_id_seq', max(id)) from squares_themes");
}
