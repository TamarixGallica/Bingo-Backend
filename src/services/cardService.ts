"use strict";

import { Square } from "../models";
import squareService, { SquareQueryParams } from "./squareService";

export interface CardQueryParams {
    rows: number;
    columns: number;
}

export enum CardResponseStatus {
    Success_OK,
    Error_TooFewCards
}

export interface CardQueryResponse {
    status: CardResponseStatus;
    card?: Square[][];
}

export const getCard = async (queryParams: CardQueryParams): Promise<CardQueryResponse> => {
    const { rows, columns } = queryParams;
    const count = rows * columns;
    const squareQueryParams: SquareQueryParams = {
        count
    };

    const squares = await squareService.getSquares(squareQueryParams);

    if (squares.length < count)
    {
        return {
            status: CardResponseStatus.Error_TooFewCards
        };
    }

    const card = new Array<Array<Square>>();

    for(let i = 0; i < rows; i++) {
        const squareRow: Square[] = [];
        for(let j = 0; j < columns; j++) {
            squareRow.push(squares.pop());
        }
        card.push(squareRow);
    }

    const cardResponse: CardQueryResponse = {
        status: CardResponseStatus.Success_OK,
        card
    };

    return cardResponse;
};

export default { getCard };
