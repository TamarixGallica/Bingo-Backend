"use strict";

import { Request, Response } from "express";
import themeService from "../services/themeService";
import squareService, { AddSquare, SquareQueryParams, UpdateSquare } from "../services/squareService";

export const getSquares = async (req: Request, res: Response): Promise<void> => {
    const queryParams: SquareQueryParams = {
        text: req.query.text as string
    };
    const squares = await squareService.getSquares(queryParams);
    res.json(squares);
};

export const addSquare = async (req: Request, res: Response): Promise<void> => {
    const squareToAdd: AddSquare = req.body;

    if (squareToAdd.themeId?.length > 0)
    {
        const themes = await themeService.getThemesById(squareToAdd.themeId);
        if (squareToAdd.themeId?.length > themes.length)
        {
            return res.status(400).end();
        }
    }

    const id = await squareService.addSquare(squareToAdd);

    const square = await squareService.getSquareById(id);

    return res.json(square).end();
};

export const updateSquare = async (req: Request, res: Response): Promise<void> => {
    const id = parseInt(req.body.id, 10);

    const squareFound = await squareService.getSquareById(id);

    if (!squareFound)
    {
        return res.status(404).end();
    }

    const squareToUpdate: UpdateSquare = req.body;

    if (squareToUpdate.themeId?.length > 0)
    {
        const themes = await themeService.getThemesById(squareToUpdate.themeId);
        if (squareToUpdate.themeId?.length > themes.length)
        {
            return res.status(400).end();
        }
    }

    await squareService.updateSquareById(squareToUpdate);

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

export const deleteSquareById = async (req: Request, res: Response): Promise<void> => {
    const id = parseInt(req.params.id, 10);

    const success = await squareService.deleteSquareById(id);

    if (success)
    {
        return res.status(204).end();
    }
    else
    {
        return res.status(404).end();
    }
};

export default { getSquares, getSquareById, updateSquare, addSquare, deleteSquareById };