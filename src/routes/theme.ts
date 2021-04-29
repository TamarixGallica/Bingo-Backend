"use strict";

import { Request, Response } from "express";
import themeService from "../services/theme";

export const getThemes = async (req: Request, res: Response): Promise<void> => {
    const themes = await themeService.getThemes();
    res.json(themes);
};

export const getThemeById = async (req: Request, res: Response): Promise<void> => {
    const id = parseInt(req.params.id, 10);

    if (Number.isNaN(id))
    {
        return res.status(400).end();
    }

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

export default { getThemes, getThemeById };