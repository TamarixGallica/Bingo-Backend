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
    describe("validate requests", () => {
        it("should return 400 Bad Request when number of rows is a string", async () => {
            const queryParams = {
                rows: "abc",
                columns: 4,
            };
            const response = await request(app).get(cardApi).query(queryParams);
            expect(response.status).toEqual(400);
        });

        it("should return 400 Bad Request when number of rows is negative", async () => {
            const queryParams = {
                rows: -10,
                columns: 4,
            };
            const response = await request(app).get(cardApi).query(queryParams);
            expect(response.status).toEqual(400);
        });

        it("should return 400 Bad Request when number of rows is lower than minimum", async () => {
            const queryParams = {
                rows: 1,
                columns: 4,
            };
            const response = await request(app).get(cardApi).query(queryParams);
            expect(response.status).toEqual(400);
        });

        it("should return 400 Bad Request when number of columns is a string", async () => {
            const queryParams = {
                rows: 4,
                columns: "abc"
            };
            const response = await request(app).get(cardApi).query(queryParams);
            expect(response.status).toEqual(400);
        });

        it("should return 400 Bad Request when number of columns is negative", async () => {
            const queryParams = {
                rows: 4,
                columns: -10
            };
            const response = await request(app).get(cardApi).query(queryParams);
            expect(response.status).toEqual(400);
        });

        it("should return 400 Bad Request when number of columns is lower than minimum", async () => {
            const queryParams = {
                rows: 4,
                columns: 1
            };
            const response = await request(app).get(cardApi).query(queryParams);
            expect(response.status).toEqual(400);
        });

        it("should return 400 Bad Request number of rows and columns aren't passed", async () => {
            const response = await request(app).get(cardApi);
            expect(response.status).toEqual(400);
        });

        it("should return 200 OK when number of rows and columns are valid", async () => {
            const queryParams = {
                rows: 3,
                columns: 4
            };
            const response = await request(app).get(cardApi).query(queryParams);
            expect(response.status).toEqual(200);
        });
    });

    describe("retrieve a card with default filters", () => {
        it("should return 200 OK", async () => {
            const queryParams = {
                rows: 5,
                columns: 5
            };
            const response = await request(app).get(cardApi).query(queryParams);
            expect(response.status).toEqual(200);
        });

        it("should return application/json as content type", async () => {
            const queryParams = {
                rows: 5,
                columns: 5
            };
            const response = await request(app).get(cardApi).query(queryParams);
            expect(response.type).toEqual("application/json");
        });

        it("should return an array", async () => {
            const queryParams = {
                rows: 5,
                columns: 5
            };
            const response = await request(app).get(cardApi).query(queryParams);
            expect(Array.isArray(response.body.card)).toEqual(true);
        });

        it("returned card should contain expected number of rows", async () => {
            const queryParams = {
                rows: 4,
                columns: 5
            };
            const response = await request(app).get(cardApi).query(queryParams);
            const card: Square[][] = response.body.card;
            expect(card.length).toEqual(queryParams.rows);
        });

        it("all rows of returned card should contain expected number of columns", async () => {
            const queryParams = {
                rows: 4,
                columns: 5
            };
            const response = await request(app).get(cardApi).query(queryParams);
            const card: Square[][] = response.body.card;
            expect(card.length).toEqual(queryParams.rows);
            for (const squareRow of card)
            {
                expect(squareRow.length).toEqual(queryParams.columns);
            }
        });

        it("should return id with all squares", async () => {
            const queryParams = {
                rows: 5,
                columns: 5
            };
            const response = await request(app).get(cardApi).query(queryParams);
            const card: Square[][] = response.body.card;
            expect(card.length).toBeGreaterThan(0);
            for (const squareRow of card)
            {
                for (const square of squareRow)
                {
                    expect(Number.isInteger(square.id)).toEqual(true);
                }
            }
        });

        it("all returned squares should have expected themes", async () => {
            const queryParams = {
                rows: 4,
                columns: 5
            };
            const response = await request(app).get(cardApi).query(queryParams);
            const card: Square[][] = response.body.card;
            expect(card.length).toEqual(queryParams.rows);
            for (const squareRow of card)
            {
                for (const square of squareRow)
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
            }
        });
    });
});
