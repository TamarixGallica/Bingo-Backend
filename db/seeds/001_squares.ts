import { Knex } from "knex";
import dotenv from "dotenv";
import { Square } from "../../src/models";

export const squareEntries: Square[] = [
    { id: 1, text: "The first one" },
    { id: 2, text: "The improved edition" },
    { id: 3, text: "About to lose count" },
    { id: 27, text: "The number 27"}
];

export async function seed(knex: Knex): Promise<void> {
    dotenv.config();

    // Deletes ALL existing entries
    await knex("squares").del();

    // Inserts seed entries
    await knex("squares").insert(squareEntries);
}
