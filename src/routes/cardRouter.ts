"use strict";

import { Request, Response } from "express";
import cardService, { CardQueryParams } from "../services/cardService";

export const getCards = async (req: Request, res: Response): Promise<void> => {
    const queryParams: CardQueryParams = {
        height: 5,
        width: 5,
    };
    const squares = await cardService.getCards(queryParams);
    return res.status(200).json(squares).end();
};

export default { getCards };
