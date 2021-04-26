"use strict";

import { Card } from "../models";
import knex from "./knex";

const tableName = "cards";
const returnedProps = ["id", "text"];

export const getCards = async (): Promise<Card[]> => {
    const cards = await knex.select(returnedProps).from<Card>(tableName);
    return cards;
};

export const getCardById = async (id: number): Promise<Card|undefined> => {
    const card = await knex.select(returnedProps).from<Card>(tableName).where("id", id);
    return card.length !== 0 ? card[0] : undefined;
};

export default { getCards, getCardById };
