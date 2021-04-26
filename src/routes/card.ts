"use strict";

import { Request, Response } from "express";
import cardService from "../services/card";

export const getCards = async (req: Request, res: Response): Promise<void> => {
    const cards = await cardService.getCards();
    res.json(cards);
};

export const getCardById = async (req: Request, res: Response): Promise<void> => {
    const id = parseInt(req.params.id, 10);

    if (Number.isNaN(id))
    {
        return res.status(400).end();
    }

    const card = await cardService.getCardById(id);

    if (card)
    {
        return res.json(card).end();
    }
    else
    {
        return res.status(404).end();
    }
};

export default { getCards, getCardById };