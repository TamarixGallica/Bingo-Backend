"use strict";

import { Request, Response } from "express";
import cardService, { CardQueryParams, CardResponseStatus } from "../services/cardService";

export const getCards = async (req: Request, res: Response): Promise<void> => {
    const queryParams: CardQueryParams = {
        rows: req.query.rows as unknown as number,
        columns: req.query.columns as unknown as number
    };

    const themeId: unknown = req.query.themeId;

    if (Array.isArray(themeId))
    {
        queryParams.themeId = themeId.map((x: unknown) => parseInt(x as string));
    }
    
    if (typeof themeId === "string" && Number.parseInt(themeId) !== NaN)
    {
        queryParams.themeId = [Number.parseInt(themeId)];
    }

    const queryResponse = await cardService.getCard(queryParams);

    if (queryResponse.status === CardResponseStatus.Error_TooFewCards || queryResponse.status === CardResponseStatus.Error_ThemeNotFound)
    {
        return res.status(400).end();
    }

    const response = {
        card: queryResponse.card
    };
    return res.status(200).json(response).end();
};

export default { getCards };
