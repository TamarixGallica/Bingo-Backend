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

export const themeTop50MoviesOfAllTime: ThemeWithoutId = { name: "IMDB top 50 movies of all time "};
export const theme1930sMovies : ThemeWithoutId = { name: "30's movies" };
export const theme1940sMovies : ThemeWithoutId = { name: "40's movies" };
export const theme1950sMovies : ThemeWithoutId = { name: "50's movies" };
export const theme1960sMovies : ThemeWithoutId = { name: "60's movies" };
export const theme1970sMovies : ThemeWithoutId = { name: "70's movies" };
export const theme1980sMovies : ThemeWithoutId = { name: "80's movies" };
export const theme1990sMovies : ThemeWithoutId = { name: "90's movies" };
export const theme2000sMovies : ThemeWithoutId = { name: "2000's movies" };
export const theme2010sMovies : ThemeWithoutId = { name: "2010's movies" };
export const theme2020sMovies : ThemeWithoutId = { name: "2020's movies" };

export const themeEntries: ThemeWithoutId[] = [
    themeTop50MoviesOfAllTime,
    theme1930sMovies,
    theme1940sMovies,
    theme1950sMovies,
    theme1960sMovies,
    theme1970sMovies,
    theme1980sMovies,
    theme1990sMovies,
    theme2000sMovies,
    theme2010sMovies,
    theme2020sMovies
];

export const squareEntries: SquareWithoutId[] = [
    { text: "The Shawshank Redemption", themes: [themeTop50MoviesOfAllTime, theme1990sMovies] },
    { text: "The Godfather", themes: [themeTop50MoviesOfAllTime, theme1970sMovies] },
    { text: "The Godfather: Part II", themes: [themeTop50MoviesOfAllTime, theme1970sMovies] },
    { text: "The Dark Knight", themes: [themeTop50MoviesOfAllTime, theme2000sMovies] },
    { text: "12 Angry Men ", themes: [themeTop50MoviesOfAllTime, theme1950sMovies] },
    { text: "Schindler's List", themes: [themeTop50MoviesOfAllTime, theme1990sMovies] },
    { text: "The Lord of the Rings: The Return of the King", themes: [themeTop50MoviesOfAllTime, theme2000sMovies] },
    { text: "Pulp Fiction", themes: [themeTop50MoviesOfAllTime, theme1990sMovies] },
    { text: "The Good, the Bad and the Ugly", themes: [themeTop50MoviesOfAllTime, theme1960sMovies] },
    { text: "The Lord of the Rings: The Fellowship of the Ring", themes: [themeTop50MoviesOfAllTime, theme2000sMovies] },
    { text: "Fight Club", themes: [themeTop50MoviesOfAllTime, theme1990sMovies] },
    { text: "Forrest Gump", themes: [themeTop50MoviesOfAllTime, theme1990sMovies] },
    { text: "Inception", themes: [themeTop50MoviesOfAllTime, theme2010sMovies] },
    { text: "The Lord of the Rings: The Two Towers", themes: [themeTop50MoviesOfAllTime, theme2000sMovies] },
    { text: "Star Wars: Episode V - The Empire Strikes Back", themes: [themeTop50MoviesOfAllTime, theme1980sMovies] },
    { text: "The Matrix", themes: [themeTop50MoviesOfAllTime, theme1990sMovies] },
    { text: "Goodfellas", themes: [themeTop50MoviesOfAllTime, theme1990sMovies] },
    { text: "One Flew Over the Cuckoo's Nest", themes: [themeTop50MoviesOfAllTime, theme1970sMovies] },
    { text: "Seven Samurai", themes: [themeTop50MoviesOfAllTime, theme1950sMovies] },
    { text: "Se7en", themes: [themeTop50MoviesOfAllTime, theme1990sMovies] },
    { text: "The Silence of the Lambs", themes: [themeTop50MoviesOfAllTime, theme1990sMovies] },
    { text: "City of God", themes: [themeTop50MoviesOfAllTime, theme2000sMovies] },
    { text: "It's a Wonderful Life", themes: [themeTop50MoviesOfAllTime, theme1940sMovies] },
    { text: "Life Is Beautiful", themes: [themeTop50MoviesOfAllTime, theme1990sMovies] },
    { text: "Star Wars: Episode IV - A New Hope", themes: [themeTop50MoviesOfAllTime, theme1970sMovies] },
    { text: "Saving Private Ryan", themes: [themeTop50MoviesOfAllTime, theme1990sMovies] },
    { text: "Spirited Away", themes: [themeTop50MoviesOfAllTime, theme2000sMovies] },
    { text: "The Green Mile", themes: [themeTop50MoviesOfAllTime, theme1990sMovies] },
    { text: "Interstellar", themes: [themeTop50MoviesOfAllTime, theme2010sMovies] },
    { text: "Parasite", themes: [themeTop50MoviesOfAllTime, theme2010sMovies] },
    { text: "Léon: The Professional", themes: [themeTop50MoviesOfAllTime, theme1990sMovies] },
    { text: "Hara-Kiri", themes: [themeTop50MoviesOfAllTime, theme1960sMovies] },
    { text: "The Usual Suspects", themes: [themeTop50MoviesOfAllTime, theme1990sMovies] },
    { text: "The Pianist", themes: [themeTop50MoviesOfAllTime, theme2000sMovies] },
    { text: "Back to the Future", themes: [themeTop50MoviesOfAllTime, theme1980sMovies] },
    { text: "Terminator 2: Judgment Day", themes: [themeTop50MoviesOfAllTime, theme1990sMovies] },
    { text: "Modern Times", themes: [themeTop50MoviesOfAllTime, theme1930sMovies] },
    { text: "Psycho", themes: [themeTop50MoviesOfAllTime, theme1960sMovies] },
    { text: "The Lion King", themes: [themeTop50MoviesOfAllTime, theme1990sMovies] },
    { text: "American History X", themes: [themeTop50MoviesOfAllTime, theme1990sMovies] },
    { text: "City Lights", themes: [themeTop50MoviesOfAllTime, theme1930sMovies] },
    { text: "Gladiator", themes: [themeTop50MoviesOfAllTime, theme2000sMovies] },
    { text: "Whiplash", themes: [themeTop50MoviesOfAllTime, theme2010sMovies] },
    { text: "The Departed", themes: [themeTop50MoviesOfAllTime, theme2000sMovies] },
    { text: "Grave of the Fireflies", themes: [themeTop50MoviesOfAllTime, theme1980sMovies] },
    { text: "The Intouchables", themes: [themeTop50MoviesOfAllTime, theme2010sMovies] },
    { text: "The Prestige", themes: [themeTop50MoviesOfAllTime, theme2000sMovies] },
    { text: "Casablanca", themes: [themeTop50MoviesOfAllTime, theme1940sMovies] },
    { text: "Once Upon a Time in the West", themes: [themeTop50MoviesOfAllTime, theme1960sMovies] },
    { text: "Rear Window", themes: [themeTop50MoviesOfAllTime, theme1950sMovies] },
    { text: "Postal", themes: [theme2000sMovies] },
    { text: "Alone in the Dark", themes: [theme2000sMovies] },
    { text: "BloodRayne", themes: [theme2000sMovies] }
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
