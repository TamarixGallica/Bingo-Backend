"use strict";

import { Square } from "../models";
import squareService, { SquareQueryParams } from "./squareService";

export interface CardQueryParams {
    rows: number;
    columns: number;
}

export const getCard = async (queryParams: CardQueryParams): Promise<Square[][]> => {
    const { rows, columns } = queryParams;
    const squareQueryParams: SquareQueryParams = {
        count: rows * columns,
    };

    const squares = await squareService.getSquares(squareQueryParams);

    const card = new Array<Array<Square>>();

    for(let i = 0; i < rows; i++) {
        const squareRow: Square[] = [];
        for(let j = 0; j < columns; j++) {
            squareRow.push(squares.pop());
        }
        card.push(squareRow);
    }

    return card;
};

export default { getCard };
