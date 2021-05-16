"use strict";

import { Square, Theme } from "../models";
import knex from "./knexService";
import themeService from "./themeService";

export interface SquareQueryParams {
    text?: string;
}

export interface UpdateSquare {
    id: number;
    text?: string;
    themeId?: number[]
}

interface SquareRow extends Square {
    theme_id?: number;
}

const squareTableName = "squares";
const squaresThemesTableName = "squares_themes";
const returnedProps = ["squares.id", "text", "squares_themes.theme_id"];

const getQueryTemplate = () => {
    const query = knex.select(returnedProps)
    .from<SquareRow>(squareTableName)
    .leftJoin(squaresThemesTableName, "squares.id", "=", "squares_themes.square_id")
    .leftJoin("themes", "squares_themes.theme_id", "=", "themes.id")
    .groupBy(["squares.id", "squares_themes.theme_id"]);
  
    return query;
};


export const getSquares = async (queryParams: SquareQueryParams): Promise<Square[]> => {
    const query = getQueryTemplate();

    if (queryParams.text) {
        query.where("text", "ilike", `%${queryParams.text}%`);
    }
    
    const squareRows = await query;
    const squares = await GetSquaresWithThemes(squareRows);
    return squares;
};

export const getSquareById = async (id: number): Promise<Square|undefined> => {
    const query = getQueryTemplate();
    const squareRows = await query.where("squares.id", id);
    if (squareRows.length == 0)
    {
        return undefined;
    }
    const squares = await GetSquaresWithThemes(squareRows);
    return squares[0];
};

export const updateSquareById = async (square: UpdateSquare): Promise<void> => {
    if (square.text)
    {
        await knex(squareTableName).where({ id: square.id }).update({ text: square.text });
    }

    if (square.themeId)
    {
        await knex(squaresThemesTableName).where({ square_id: square.id }).delete();
        if (square.themeId.length > 0) {
            const rowsToAdd = square.themeId.map((themeId) => ({ square_id: square.id, theme_id: themeId}));
            await knex(squaresThemesTableName).insert(rowsToAdd);
        }
    }
};

const GetSquaresWithThemes = async (squareRows: SquareRow[]): Promise<Square[]> => {
    const squares: Square[] = [];
    const themes: Theme[] = await themeService.getThemes({name: null});

    squareRows.forEach((row) => {
        const {theme_id, ...rest} = row;

        if (!squares.find((square) => square.id === row.id))
        {
            squares.push({ ...rest, themes: []});
        }

        const square = squares.find((square) => square.id === row.id);

        if (theme_id)
        {
            const theme = themes.find((theme) => theme.id === theme_id);
            square.themes.push(theme);
        }
    });

    return squares;
};

export default { getSquares, getSquareById, updateSquareById };
