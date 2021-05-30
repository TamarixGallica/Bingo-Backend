"use strict";

import { Square } from "../models";
import squareService, { SquareQueryParams } from "./squareService";

export interface CardQueryParams {
    height: number;
    width: number;
}

export const getCards = async (queryParams: CardQueryParams): Promise<Square[]> => {
    const squareQueryParams: SquareQueryParams = {
        count: queryParams.height * queryParams.width,
    };

    const squares = await squareService.getSquares(squareQueryParams);
    return squares;
};

export default { getCards };
