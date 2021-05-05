"use strict";

import { Theme } from "../models";
import knex from "./knexService";

const tableName = "themes";
const returnedProps = ["id", "name"];

export const getThemes = async (): Promise<Theme[]> => {
    const themes = await knex.select(returnedProps).from<Theme>(tableName);
    return themes;
};

export const getThemeById = async (id: number): Promise<Theme|undefined> => {
    const themes = await knex.select(returnedProps).from<Theme>(tableName).where("id", id);
    return themes.length !== 0 ? themes[0] : undefined;
};

export default { getThemes, getThemeById };
