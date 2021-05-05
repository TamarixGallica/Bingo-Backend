"use strict";

import { Request, Response } from "express";
import squareService, { SquareQueryParams } from "../services/square";

export const getSquares = async (req: Request, res: Response): Promise<void> => {
    const queryParams: SquareQueryParams = {
        text: req.query.text as string
    };
    const squares = await squareService.getSquares(queryParams);
    res.json(squares);
};

export const getSquareById = async (req: Request, res: Response): Promise<void> => {
    const id = parseInt(req.params.id, 10);

    const square = await squareService.getSquareById(id);

    if (square)
    {
        return res.json(square).end();
    }
    else
    {
        return res.status(404).end();
    }
};

export default { getSquares, getSquareById };