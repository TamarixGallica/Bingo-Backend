"use strict";

import { Request, Response } from "express";
import themeService, { AddTheme, ThemeQueryParams, UpdateTheme } from "../services/themeService";

export const getThemes = async (req: Request, res: Response): Promise<void> => {
    const queryParams: ThemeQueryParams = {
        name: req.query.name as string
    };
    const themes = await themeService.getThemes(queryParams);
    res.json(themes);
};

export const getThemeById = async (req: Request, res: Response): Promise<void> => {
    const id = parseInt(req.params.id, 10);

    const theme = await themeService.getThemeById(id);

    if (theme)
    {
        return res.json(theme).end();
    }
    else
    {
        return res.status(404).end();
    }
};

export const addTheme = async (req: Request, res: Response): Promise<void> => {
    const themeToAdd: AddTheme = req.body;

    const id = await themeService.addTheme(themeToAdd);

    const theme = await themeService.getThemeById(id);

    return res.json(theme).end();
};

export const updateTheme = async (req: Request, res: Response): Promise<void> => {
    const id = parseInt(req.body.id, 10);

    const themeFound = await themeService.getThemeById(id);

    if (!themeFound)
    {
        return res.status(404).end();
    }

    const themeToUpdate: UpdateTheme = req.body;

    await themeService.updateThemeById(themeToUpdate);

    const updatedTheme = await themeService.getThemeById(id);

    return res.json(updatedTheme).end();
};

export default { getThemes, getThemeById, addTheme, updateTheme };