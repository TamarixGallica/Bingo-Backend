import { Knex } from "knex";
import dotenv from "dotenv";
import { Card } from "../../src/models";

export const cardEntries: Card[] = [
    { id: 1, text: "The first one" },
    { id: 2, text: "The improved edition" },
    { id: 3, text: "About to lose count" },
    { id: 27, text: "The number 27"}
];

export async function seed(knex: Knex): Promise<void> {
    dotenv.config();

    // Deletes ALL existing entries
    await knex("cards").del();

    // Inserts seed entries
    await knex("cards").insert(cardEntries);
}
