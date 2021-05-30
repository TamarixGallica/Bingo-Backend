import { Knex } from "knex";
import dotenv from "dotenv";
import { Square } from "../../src/models";
import { Theme } from "../../src/models";

const squareTable = "squares";
const themeTable = "themes";
const squaresThemesTable = "squares_themes";

type ThemeWithoutId = Omit<Theme, "id">;

type SquareWithoutId = Omit<Square, "id" | "themes"> & {
    themes: ThemeWithoutId[]
};

export const themeEntries: ThemeWithoutId[] = [
    { name: "Contains 'the'" },
    { name: "Refers to numbers" },
    { name: "Improved" }
];

export const squareEntries: SquareWithoutId[] = [
    { text: "The first one", themes: [themeEntries[0], themeEntries[1]] },
    { text: "The improved edition", themes: [themeEntries[0], themeEntries[2]] },
    { text: "About to lose count", themes: [] },
    { text: "The number 27", themes: [themeEntries[0], themeEntries[1]] }
];

const addThemes = async (knex: Knex, themes: ThemeWithoutId[]): Promise<Theme[]> => {
    const addedThemes = await Promise.all(themes.map(async (theme) => {
        const insertedIds = await knex(themeTable).insert(theme).returning("id");
        return { id: insertedIds[0], ...theme };
    }));

    return addedThemes;
};

const addSquares = async (knex: Knex, squares: SquareWithoutId[], addedThemes: Theme[]): Promise<Square[]> => {
    const addedSquares = await Promise.all(squares.map(async (square) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { themes, ...squareProperties } = square;
        const insertedIds = await knex(squareTable).insert(squareProperties).returning("id");
        const insertedId = insertedIds[0];

        const updatedThemes = await Promise.all(square.themes.map(async (squareTheme) => {
            const themeId = addedThemes.find(t => t.name == squareTheme.name).id;
            await knex(squaresThemesTable).insert({ square_id: insertedId, theme_id: themeId });
            return { id: themeId, ...squareTheme };
        }));

        return { id: insertedIds[0], themes: updatedThemes, ...squareProperties };
    }));

    return addedSquares;
};

export async function seed(knex: Knex): Promise<void> {
    dotenv.config();

    // Deletes ALL existing entries
    await knex(squaresThemesTable).del();
    await knex(squareTable).del();
    await knex(themeTable).del();

    const addedThemes = await addThemes(knex, themeEntries);

    await addSquares(knex, squareEntries, addedThemes);
}
