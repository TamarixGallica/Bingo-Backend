import { Knex } from "knex";
import dotenv from "dotenv";
import { squareEntries } from "./001_squares";
import { themeEntries } from "./002_themes";

const squaresThemesTable = "squares_themes";

interface SquareTheme {
    square_id: number;
    theme_id: number;
}

const createEntries = (): SquareTheme[] => {
    const entries: SquareTheme[] = [];

    // Add link between squares containing word 'the' and the theme
    const theSquares = squareEntries.filter(x => x.text.toLowerCase().includes("the"));
    theSquares.forEach(x => {
        const entry: SquareTheme = { square_id: x.id, theme_id: themeEntries[0].id};
        entries.push(entry);
    });

    // Add link between squares containing a reference to a number and the theme
    const numberSquares = squareEntries.filter(x => x.text.toLowerCase().includes("one") || x.text.toLowerCase().includes("27"));
    numberSquares.forEach(x => {
        const entry: SquareTheme = { square_id: x.id, theme_id: themeEntries[1].id};
        entries.push(entry);
    });

    // Add link between squares containing word 'improved' and the theme
    const improvedSquares = squareEntries.filter(x => x.text.toLowerCase().includes("improved"));
    improvedSquares.forEach(x => {
        const entry: SquareTheme = { square_id: x.id, theme_id: themeEntries[2].id};
        entries.push(entry);
    });

    return entries;
};

export async function seed(knex: Knex): Promise<void> {
    dotenv.config();

    // Deletes ALL existing entries
    await knex(squaresThemesTable).del();

    // Inserts seed entries
    await knex(squaresThemesTable).insert(createEntries());
}