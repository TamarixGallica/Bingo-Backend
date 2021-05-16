"use strict";

import { Request, Response } from "express";
import squareService, { SquareQueryParams } from "../services/squareService";

export const getSquares = async (req: Request, res: Response): Promise<void> => {
    const queryParams: SquareQueryParams = {
        text: req.query.text as string
    };
    const squares = await squareService.getSquares(queryParams);
    res.json(squares);
};

export const updateSquare = async (req: Request, res: Response): Promise<void> => {
    const id = parseInt(req.body.id, 10);

    const squareFound = await squareService.getSquareById(id);

    if (!squareFound)
    {
        return res.status(404).end();
    }

    await squareService.updateSquareById(req.body);

    const updatedSquare = await squareService.getSquareById(id);
    return res.json(updatedSquare).end();
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

export default { getSquares, getSquareById, updateSquare };