import request from "supertest";
import app from "../src/app";
import knex from "../src/config/database";
import { Square } from "../src/models";
import { squareEntries, theme1940sMovies, theme1950sMovies, theme1970sMovies, theme1980sMovies, theme1990sMovies, theme2000sMovies, theme2010sMovies, themeTop50MoviesOfAllTime } from "../db/seeds/001_squares_and_themes";
import { getAllThemes, getNonExistingThemeId } from "./shared";

const cardApi = "/api/card";

interface QueryParams {
    rows: number;
    columns: number;
    themeId?: number | Array<number>
}

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
            const queryParams: QueryParams = {
                rows: -10,
                columns: 4,
            };
            const response = await request(app).get(cardApi).query(queryParams);
            expect(response.status).toEqual(400);
        });

        it("should return 400 Bad Request when number of rows is lower than minimum", async () => {
            const queryParams: QueryParams = {
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
            const queryParams: QueryParams = {
                rows: 4,
                columns: -10
            };
            const response = await request(app).get(cardApi).query(queryParams);
            expect(response.status).toEqual(400);
        });

        it("should return 400 Bad Request when number of columns is lower than minimum", async () => {
            const queryParams: QueryParams = {
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
            const queryParams: QueryParams = {
                rows: 3,
                columns: 4
            };
            const response = await request(app).get(cardApi).query(queryParams);
            expect(response.status).toEqual(200);
        });

        it("should return 400 Bad Request when not enough cards without a theme", async () => {
            const queryParams: QueryParams = {
                rows: 10,
                columns: 10
            };
            const response = await request(app).get(cardApi).query(queryParams);
            expect(response.status).toEqual(400);
        });

        it("should return 400 Bad Request when not enough cards with the requested theme", async () => {
            const themes = await getAllThemes();
            const themeId = themes.find(x => x.name === theme1950sMovies.name).id;
            const queryParams: QueryParams = {
                rows: 3,
                columns: 3,
                themeId
            };
            const response = await request(app).get(cardApi).query(queryParams);
            expect(response.status).toEqual(400);
        });

        it("should return 400 Bad Request when requesting a card with non-existing theme", async () => {
            const themeId = await getNonExistingThemeId();
            const queryParams: QueryParams = {
                rows: 4,
                columns: 4,
                themeId: themeId
            };
            const response = await request(app).get(cardApi).query(queryParams);
            expect(response.status).toEqual(400);
        });

        it("should return 200 OK when requesting a card with one existing theme", async () => {
            const themes = await getAllThemes();
            const themeId = themes.find(x => x.name === themeTop50MoviesOfAllTime.name).id;
            const queryParams: QueryParams = {
                rows: 4,
                columns: 4,
                themeId
            };
            const response = await request(app).get(cardApi).query(queryParams);
            expect(response.status).toEqual(200);
        });

        it("should return 200 OK when requesting a card with multiple existing themes", async () => {
            const themes = await getAllThemes();
            const themeId = themes.filter(x => x.name === theme2000sMovies.name || x.name === theme2010sMovies.name).map(x => x.id);
            const queryParams: QueryParams = {
                rows: 4,
                columns: 4,
                themeId
            };
            const response = await request(app).get(cardApi).query(queryParams);
            expect(response.status).toEqual(200);
        });
    });

    describe("retrieve a card with default filters", () => {
        it("should return 200 OK", async () => {
            const queryParams: QueryParams = {
                rows: 5,
                columns: 5
            };
            const response = await request(app).get(cardApi).query(queryParams);
            expect(response.status).toEqual(200);
        });

        it("should return application/json as content type", async () => {
            const queryParams: QueryParams = {
                rows: 5,
                columns: 5
            };
            const response = await request(app).get(cardApi).query(queryParams);
            expect(response.type).toEqual("application/json");
        });

        it("should return an array", async () => {
            const queryParams: QueryParams = {
                rows: 5,
                columns: 5
            };
            const response = await request(app).get(cardApi).query(queryParams);
            expect(Array.isArray(response.body.card)).toEqual(true);
        });

        it("returned card should contain expected number of rows", async () => {
            const queryParams: QueryParams = {
                rows: 4,
                columns: 5
            };
            const response = await request(app).get(cardApi).query(queryParams);
            const card: Square[][] = response.body.card;
            expect(card.length).toEqual(queryParams.rows);
        });

        it("all rows of returned card should contain expected number of columns", async () => {
            const queryParams: QueryParams = {
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
            const queryParams: QueryParams = {
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
            const queryParams: QueryParams = {
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

        it("should not return squares in the same order for multiple cards", async () => {
            const returnedSquareIds = new Array<Array<number>>();
            for (let i = 0; i < 5; i++)
            {
                const queryParams: QueryParams = {
                    rows: 7,
                    columns: 7
                };
                const response = await request(app).get(cardApi).query(queryParams);
                const card: Square[][] = response.body.card;
                const returnedIds = [];
                card.forEach((row) => {
                    returnedIds.push(row.map(x => x.id));
                });
                returnedSquareIds.push(returnedIds);
            }
            let allInSameOrder = true;
            for (let i = 0; i < returnedSquareIds.length - 1; i++)
            {
                if (returnedSquareIds[i] !== returnedSquareIds[i + 1])
                {
                    allInSameOrder = false;
                }
            }
            expect(allInSameOrder).toEqual(false);
        });

        it("should not return the same squares for multiple cards", async () => {
            const returnedSquareIds = new Array<Array<number>>();
            for (let i = 0; i < 5; i++)
            {
                const queryParams: QueryParams = {
                    rows: 3,
                    columns: 3
                };
                const response = await request(app).get(cardApi).query(queryParams);
                const card: Square[][] = response.body.card;
                const returnedIds = [];
                card.forEach((row) => {
                    returnedIds.push(row.map(x => x.id));
                });
                returnedSquareIds.push(returnedIds);
            }
            let allSameSquares = true;
            for (let i = 0; i < returnedSquareIds.length - 1; i++)
            {
                if (returnedSquareIds[i].sort() !== returnedSquareIds[i + 1].sort())
                {
                    allSameSquares = false;
                }
            }
            expect(allSameSquares).toEqual(false);
        });
    });

    describe("retrieve a card with theme filter", () => {
        it("should return application/json as content type", async () => {
            const themes = await getAllThemes();
            const themeId = themes.find(x => x.name === theme1990sMovies.name).id;
            const queryParams: QueryParams = {
                rows: 4,
                columns: 4,
                themeId
            };
            const response = await request(app).get(cardApi).query(queryParams);
            expect(response.type).toEqual("application/json");
        });

        it("should return an array", async () => {
            const themes = await getAllThemes();
            const themeId = themes.find(x => x.name === theme1990sMovies.name).id;
            const queryParams: QueryParams = {
                rows: 4,
                columns: 4,
                themeId
            };
            const response = await request(app).get(cardApi).query(queryParams);
            expect(Array.isArray(response.body.card)).toEqual(true);
        });

        it("each square should contain the requested theme", async () => {
            const themes = await getAllThemes();
            const themeId = themes.find(x => x.name === theme1990sMovies.name).id;
            const queryParams: QueryParams = {
                rows: 4,
                columns: 4,
                themeId
            };
            const response = await request(app).get(cardApi).query(queryParams);
            const card: Square[][] = response.body.card;
            card.forEach((squareRow) => {
                squareRow.forEach((square) => {
                    expect(square.themes.map(x => x.id).includes(themeId)).toEqual(true);
                });
            });
        });

        it("each square should contain one of the requested themes", async () => {
            const themes = await getAllThemes();
            const themeId = themes.filter(x =>
                x.name === theme1980sMovies.name ||
                x.name === theme1970sMovies.name ||
                x.name === theme1940sMovies.name
                ).map(x => x.id);
            const queryParams: QueryParams = {
                rows: 3,
                columns: 3,
                themeId
            };
            const response = await request(app).get(cardApi).query(queryParams);
            const card: Square[][] = response.body.card;
            card.forEach((squareRow) => {
                squareRow.forEach((square) => {
                    expect(square.themes.filter(x => themeId.includes(x.id)).length).toEqual(1);
                });
            });
        });
    });
});
