"use strict";

import { Request, Response } from "express";
import cardService, { CardQueryParams } from "../services/cardService";

export const getCards = async (req: Request, res: Response): Promise<void> => {
    const queryParams: CardQueryParams = {
        rows: req.query.rows as unknown as number,
        columns: req.query.columns as unknown as number
    };
    const card = await cardService.getCard(queryParams);
    const response = {
        card
    };
    return res.status(200).json(response).end();
};

export default { getCards };
