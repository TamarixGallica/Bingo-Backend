"use strict";

import { Square } from "../models";
import knex from "./knex";

const tableName = "squares";
const returnedProps = ["id", "text"];

export const getSquares = async (): Promise<Square[]> => {
    const squares = await knex.select(returnedProps).from<Square>(tableName);
    return squares;
};

export const getSquareById = async (id: number): Promise<Square|undefined> => {
    const squares = await knex.select(returnedProps).from<Square>(tableName).where("id", id);
    return squares.length !== 0 ? squares[0] : undefined;
};

export default { getSquares, getSquareById };
