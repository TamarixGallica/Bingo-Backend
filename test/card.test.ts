import request from "supertest";
import app from "../src/app";
import knex from "../src/services/knexService";
import { Square } from "../src/models";
import { squareEntries } from "../db/seeds/001_squares_and_themes";

const cardApi = "/api/card";

beforeAll(async () => {
    await knex.migrate.rollback(null, true);
    await knex.migrate.latest();
    await knex.seed.run();
});

describe("GET /api/card", () => {
    describe("retrieve a card with default filters", () => {
        it("should return 200 OK", async () => {
            const response = await request(app).get(cardApi);
            expect(response.status).toEqual(200);
        });

        it("should return application/json as content type", async () => {
            const response = await request(app).get(cardApi);
            expect(response.type).toEqual("application/json");
        });

        it("should return an array", async () => {
            const response = await request(app).get(cardApi);
            expect(Array.isArray(response.body)).toEqual(true);
        });

        it("should return expected number of squares", async () => {
            const response = await request(app).get(cardApi);
            const returnedSquares: Square[] = response.body;
            expect(returnedSquares.length).toEqual(25);
        });

        it("should return id with all squares", async () => {
            const response = await request(app).get(cardApi);
            const returnedSquares: Square[] = response.body;
            expect(returnedSquares.length).toBeGreaterThan(0);
            for (const square of returnedSquares)
            {
                expect(Number.isInteger(square.id)).toEqual(true);
            }
        });

        it("all returned squares should have expected text and themes", async () => {
            const response = await request(app).get(cardApi);
            const returnedSquares: Square[] = response.body;
            expect(returnedSquares.length).toEqual(25);
            for (const square of returnedSquares)
            {
                const squareEntry = squareEntries.find(x => x.text == square.text);
                expect(squareEntry).not.toBeUndefined();
                expect(squareEntry.text).toEqual(square.text);
                expect(Array.isArray(squareEntry.themes)).toEqual(true);
                expect(squareEntry.themes.length).toEqual(square.themes.length);
                square.themes.forEach((theme) => {
                    const returnedTheme = squareEntry.themes.find((t) => t.name == theme.name);
                    expect(returnedTheme.name).toEqual(theme.name);
                });
            }
        });
    });
});
