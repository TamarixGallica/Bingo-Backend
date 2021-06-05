"use strict";

import { Square, Theme } from "../models";
import knex from "./knexService";

export interface SquareQueryParams {
    text?: string;
    count?: number;
    themeId?: number[];
}

export interface AddSquare {
    text?: string;
    themeId?: number[]
}

export interface UpdateSquare {
    id: number;
    text?: string;
    themeId?: number[]
}

interface SquareRow extends Square {
    theme_id?: number;
    name?: string;
}

const squareTableName = "squares";
const squaresThemesTableName = "squares_themes";
const returnedProps = ["squares.id", "text", "squares_themes.theme_id", "themes.name"];

const getQueryTemplate = () => {
    const query = knex.select(returnedProps)
    .from<SquareRow>(squareTableName)
    .leftJoin(squaresThemesTableName, "squares.id", "=", "squares_themes.square_id")
    .leftJoin("themes", "squares_themes.theme_id", "=", "themes.id")
    .groupBy(["squares.id", "squares_themes.theme_id", "themes.name"]);
  
    return query;
};

export const getSquares = async (queryParams: SquareQueryParams): Promise<Square[]> => {
    const squareIdQuery = knex.select("squares.id")
        .from(squareTableName)
        .leftJoin(squaresThemesTableName, "squares.id", "=", "squares_themes.square_id")
        .leftJoin("themes", "squares_themes.theme_id", "=", "themes.id")
        .groupBy(["squares.id"]);
    
    if (queryParams.text) {
        squareIdQuery.where("text", "ilike", `%${queryParams.text}%`);
    }

    if (queryParams.themeId) {
        squareIdQuery.whereIn("squares_themes.theme_id", queryParams.themeId);
    }

    if (queryParams.count)
    {
        squareIdQuery.limit(queryParams.count);
    }

    const squareIds = await squareIdQuery;
    
    const query = getQueryTemplate();
    query.whereIn("squares.id", squareIds.map(x => x.id));
    const squareRows = await query;
    const squares = await AssignThemesToSquares(squareRows);
    return squares;
};

export const getSquareById = async (id: number): Promise<Square|undefined> => {
    const query = getQueryTemplate();
    const squareRows = await query.where("squares.id", id);
    if (squareRows.length == 0)
    {
        return undefined;
    }
    const squares = await AssignThemesToSquares(squareRows);
    return squares[0];
};

export const addSquare = async (square: AddSquare): Promise <number> => {
    const id = await knex(squareTableName).insert({ text: square.text }, "id");

    if (square.themeId?.length > 0)
    {
        const rowsToAdd = square.themeId.map((themeId) => ({ square_id: id[0], theme_id: themeId}));
        await knex(squaresThemesTableName).insert(rowsToAdd);
    }

    return id[0];
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

export const deleteSquareById = async (id: number): Promise<boolean> => {
    const deletedRows = await knex(squareTableName).where("id", id).delete();

    return deletedRows === 1;
};

const AssignThemesToSquares = async (squareRows: SquareRow[]): Promise<Square[]> => {
    const squares: Square[] = [];

    squareRows.forEach((row) => {
        const {theme_id, name, ...rest} = row;

        if (!squares.find((square) => square.id === row.id))
        {
            squares.push({ ...rest, themes: []});
        }

        const square = squares.find((square) => square.id === row.id);

        if (theme_id)
        {
            const theme: Theme = {
                id: theme_id,
                name
            };
            square.themes.push(theme);
        }
    });

    return squares;
};

export default { getSquares, getSquareById, updateSquareById, addSquare, deleteSquareById };
