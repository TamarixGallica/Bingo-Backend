"use strict";

import { Theme } from "../models";
import knex from "./knexService";

export interface ThemeQueryParams {
    name?: string;
}

export interface AddTheme {
    name: string;
}

const tableName = "themes";
const returnedProps = ["id", "name"];

export const getThemes = async (queryParams: ThemeQueryParams): Promise<Theme[]> => {
    const query = knex.select(returnedProps).from<Theme>(tableName);

    if (queryParams.name) {
        query.where("name", "ilike", `%${queryParams.name}%`);
    }

    const themes = await query;
    return themes;
};

export const getThemeById = async (id: number): Promise<Theme|undefined> => {
    const themes = await knex.select(returnedProps).from<Theme>(tableName).where("id", id);
    return themes.length !== 0 ? themes[0] : undefined;
};

export const getThemesById = async (id: number[]): Promise<Theme[]> => {
    const themes = await knex.select(returnedProps).from<Theme>(tableName).whereIn("id", id);
    return themes;
};

export const addTheme = async (theme: AddTheme): Promise<number> => {
    const id = await knex(tableName).insert({ name: theme.name }, "id");
    return id[0];
};

export default { getThemes, getThemeById, getThemesById, addTheme };
