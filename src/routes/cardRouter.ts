"use strict";

import { Request, Response } from "express";
import cardService, { CardQueryParams, CardResponseStatus } from "../services/cardService";

export const getCards = async (req: Request, res: Response): Promise<void> => {
    const queryParams: CardQueryParams = {
        rows: req.query.rows as unknown as number,
        columns: req.query.columns as unknown as number
    };
    const queryResponse = await cardService.getCard(queryParams);

    if (queryResponse.status === CardResponseStatus.Error_TooFewCards)
    {
        return res.status(400).end();
    }

    const response = {
        card: queryResponse.card
    };
    return res.status(200).json(response).end();
};

export default { getCards };
