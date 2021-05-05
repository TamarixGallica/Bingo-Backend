"use strict";

import { Square } from "../models";
import knex from "./knexService";

export interface SquareQueryParams {
    text?: string;
}

const tableName = "squares";
const returnedProps = ["id", "text"];

export const getSquares = async (queryParams: SquareQueryParams): Promise<Square[]> => {
    const query = knex.select(returnedProps).from<Square>(tableName);

    if (queryParams.text) {
        query.where("text", "ilike", `%${queryParams.text}%`);
    }

    const squares = await query;
    return squares;
};

export const getSquareById = async (id: number): Promise<Square|undefined> => {
    const squares = await knex.select(returnedProps).from<Square>(tableName).where("id", id);
    return squares.length !== 0 ? squares[0] : undefined;
};

export default { getSquares, getSquareById };
