import request from "supertest";
import app from "../src/app";
import knex from "../src/config/database";
import { Square, Theme } from "../src/models";
import { squareEntries } from "../db/seeds/001_squares_and_themes";
import { getAllThemes, getCookieHeader, getNonExistingThemeId, getTooLongText } from "./shared";

const squareApi = "/api/square";

beforeAll(async () => {
    await knex.migrate.rollback(null, true);
    await knex.migrate.latest();
});

const getAllSquares = async (): Promise<Square[]> => {
    const response = await request(app).get(squareApi);
    return response.body;
};

const getNonExistingSquareId = async () => {
    const allSquares = await getAllSquares();
    return Math.max(...allSquares.map(x => x.id)) + 1;
};

const getExistingThemeIds = async (): Promise<number[]> => {
    const allThemes = await getAllThemes();
    return allThemes.map(x => x.id);
};

describe("GET /api/square", () => {
    beforeAll(async () => {
        await knex.seed.run();
    });

    describe("retrieve all squares", () => {
        it("should return 200 OK", async () => {
            const response = await request(app).get(squareApi);
            expect(response.status).toEqual(200);
        });

        it("should return json", async () => {
            const response = await request(app).get(squareApi);
            expect(response.type).toEqual("application/json");
        });

        it("should return an array", async () => {
            const response = await request(app).get(squareApi);
            expect(Array.isArray(response.body)).toEqual(true);
        });

        it("should return id with all squares", async () => {
            const response = await request(app).get(squareApi);
            const returnedSquares: Square[] = response.body;
            expect(returnedSquares.length).toEqual(squareEntries.length);
            for (const square of returnedSquares)
            {
                expect(Number.isInteger(square.id)).toEqual(true);
            }
        });

        it("should return all squares with expected text and themes", async () => {
            const response = await request(app).get(squareApi);
            const returnedSquares: Square[] = response.body;
            expect(returnedSquares.length).toEqual(squareEntries.length);
            for (const square of squareEntries)
            {
                const returnedSquare = returnedSquares.find(x => x.text == square.text);
                expect(returnedSquare).not.toBeUndefined();
                expect(returnedSquare.text).toEqual(square.text);
                expect(Array.isArray(returnedSquare.themes)).toEqual(true);
                expect(returnedSquare.themes.length).toEqual(square.themes.length);
                square.themes.forEach((theme) => {
                    const returnedTheme = returnedSquare.themes.find((t) => t.name == theme.name);
                    expect(returnedTheme.name).toEqual(theme.name);
                });
            }
        });
    });

    describe("filter based on text", () => {
        it("should allow only a string as a text filter", async () => {
            const response1 = await request(app).get(squareApi).query({ text: ["foo", "bar"]});
            expect(response1.status).toEqual(400);

            const response2 = await request(app).get(`${squareApi}?text=foo&text=bar`);
            expect(response2.status).toEqual(400);

            const response3 = await request(app).get(squareApi).query({ text: { foo: "foo", bar: "bar"}});
            expect(response3.status).toEqual(400);

            const response4 = await request(app).get(`${squareApi}?text=`);
            expect(response4.status).toEqual(400);

            const response5 = await request(app).get(squareApi).query({ text: "foo"});
            expect(response5.status).toEqual(200);
        });

        it("should return specific square with full text", async () => {
            const response = await request(app).get(squareApi).query({text: squareEntries[0].text});
            const returnedSquares: Square[] = response.body;
            expect(response.status).toEqual(200);
            expect(returnedSquares.length).toEqual(1);
        });

        it("should return expected number of results with a single word", async () => {
            const verifyNumberOfResult = async (text: string) => {
                const matchingSquares = squareEntries.filter(s => s.text.toLowerCase().includes(text));
                const response = await request(app).get(squareApi).query({text});
                const returnedSquares: Square[] = response.body;
                expect(response.status).toEqual(200);
                expect(returnedSquares.length).toEqual(matchingSquares.length);
            };

            await verifyNumberOfResult("the");
            await verifyNumberOfResult("lose");
            await verifyNumberOfResult("on");
        });
    });

    describe("retrieve square by id", () => {
        it("should return 200 OK for square in database", async () => {
            const allSquares = await getAllSquares();
            const square = allSquares[0];
            const response = await request(app).get(`${squareApi}/${square.id}`);
            expect(response.status).toEqual(200);
        });

        it("should return json for square in database", async () => {
            const allSquares = await getAllSquares();
            const square = allSquares[1];
            const response = await request(app).get(`${squareApi}/${square.id}`);
            expect(response.type).toEqual("application/json");
        });

        it("should not return an array for a square in database", async () =>{
            const allSquares = await getAllSquares();
            const square = allSquares[2];
            const response = await request(app).get(`${squareApi}/${square.id}`);
            expect(Array.isArray(response.body)).toEqual(false);
        });

        it("should return square with expected name and themes", async () => {
            const allSquares = await getAllSquares();
            const square = allSquares[1];
            const response = await request(app).get(`${squareApi}/${square.id}`);
            const receivedSquare: Square = response.body;
            expect(receivedSquare.id).toEqual(square.id);
            expect(receivedSquare.text).toEqual(square.text);
            expect(Array.isArray(receivedSquare.themes)).toEqual(true);
            expect(receivedSquare.themes.length).toEqual(square.themes.length);
            square.themes.forEach((theme: Theme) => {
                const returnedTheme = receivedSquare.themes.find((t) => t.name == theme.name);
                expect(returnedTheme).not.toBeUndefined();
            });
    });

        it("should return 400 Bad Request when non-number is used as id", async () => {
            const response = await request(app).get(`${squareApi}/abc`);
            expect(response.status).toEqual(400);
        });

        it("should return 400 Bad Request when negative number is used as id", async () => {
            const response = await request(app).get(`${squareApi}/-4`);
            expect(response.status).toEqual(400);
        });

        it("should return 404 Not Found for square not in database", async () => {
            const id = await getNonExistingSquareId();
            const response = await request(app).get(`${squareApi}/${id}`);
            expect(response.status).toEqual(404);
        });
    });
});

describe("POST /api/square", () => {
    describe("validate requests", () => {
        beforeAll(async () => {
            await knex.seed.run();
        });

        it("should return 400 Bad Request when using an empty body", async () => {
            const response = await request(app).post(squareApi).send();
            expect(response.status).toEqual(400);
        });

        it("should return 400 Bad Request when supplying id and text", async () => {
            const response = await request(app).post(squareApi).send({ id: 1, text: "foo" });
            expect(response.status).toEqual(400);
        });

        it("should return 400 Bad Request when text is longer than allowed", async () => {
            const text = getTooLongText();
            const response = await request(app).post(squareApi).send({ text });
            expect(response.status).toEqual(400);
        });

        it("should return 400 Bad Request when text and non-existing theme id are supplied", async () => {
            const cookieHeader = await getCookieHeader();
            const themeId = await getNonExistingThemeId();
            const response = await request(app).post(squareApi).set("Cookie", cookieHeader).send({ text: "foo", themeId: [themeId] });
            expect(response.status).toEqual(400);
        });

        it("should return 401 Unauthorized when not passing a token", async () => {
            const response = await request(app).post(squareApi).send({ text: "authorization"});
            expect(response.status).toEqual(401);
        });

        it("should return 401 Unauthorized when passing an invalid token", async () => {
            const response = await request(app).post(squareApi).send({ text: "authorization"}).set("Cookie", ["token=aabbccddeeff00112233445566"]);
            expect(response.status).toEqual(401);
        });

        it("should return 200 when text is supplied", async () => {
            const cookieHeader = await getCookieHeader();
            const response = await request(app).post(squareApi).set("Cookie", cookieHeader).send({ text: "foo mama's pants" });
            expect(response.status).toEqual(200);
        });

        it("should return 200 when text and existing theme ids are supplied", async () => {
            const cookieHeader = await getCookieHeader();
            const themeIds = await getExistingThemeIds();
            const response = await request(app).post(squareApi).set("Cookie", cookieHeader).send({ text: "foo", themeId: themeIds });
            expect(response.status).toEqual(200);
        });
    });

    describe("add a square", () => {
        beforeEach(async () => {
            await knex.seed.run();
        });

        it("should add a square without theme id array", async () => {
            const cookieHeader = await getCookieHeader();
            const text = "foobar";
            const response = await request(app).post(squareApi).set("Cookie", cookieHeader).send({ text });
            expect(response.status).toEqual(200);
            const receivedSquare: Square = response.body;
            expect(Number.isInteger(receivedSquare.id)).toEqual(true);
            expect(receivedSquare.text).toEqual(text);
            expect(receivedSquare.themes.length).toEqual(0);
        });

        it("should add a square with empty theme id array", async () => {
            const cookieHeader = await getCookieHeader();
            const text = "tinstafl";
            const response = await request(app).post(squareApi).set("Cookie", cookieHeader).send({ text, themeId: [] });
            expect(response.status).toEqual(200);
            const receivedSquare: Square = response.body;
            expect(Number.isInteger(receivedSquare.id)).toEqual(true);
            expect(receivedSquare.text).toEqual(text);
            expect(receivedSquare.themes.length).toEqual(0);
        });

        it("should add a square with a single theme id", async () => {
            const cookieHeader = await getCookieHeader();
            const text = "tinstafl";
            const themes = (await getAllThemes()).slice(-1, 1);
            const themeIds = themes.map(t => t.id);
            const response = await request(app).post(squareApi).set("Cookie", cookieHeader).send({ text, themeId: themeIds });
            expect(response.status).toEqual(200);
            const receivedSquare: Square = response.body;
            expect(Number.isInteger(receivedSquare.id)).toEqual(true);
            expect(receivedSquare.text).toEqual(text);
            expect(receivedSquare.themes).toEqual(themes);
        });

        it("should add a square with multiple theme ids", async () => {
            const cookieHeader = await getCookieHeader();
            const text = "tinstafl";
            const allThemes = await getAllThemes();
            const allThemeIds = allThemes.map(t => t.id);
            const themeIds = allThemeIds.slice(0, 2);
            const response = await request(app).post(squareApi).set("Cookie", cookieHeader).send({ text, themeId: themeIds });
            expect(response.status).toEqual(200);
            const receivedSquare: Square = response.body;
            expect(Number.isInteger(receivedSquare.id)).toEqual(true);
            expect(receivedSquare.text).toEqual(text);
            expect(receivedSquare.themes.sort(t => t.id)).toEqual(allThemes.filter(t => themeIds.includes(t.id)).sort(t => t.id));
        });
    });
});

describe("PUT /api/square", () => {
    describe("validate requests", () => {
        beforeAll(async () => {
            await knex.seed.run();
        });

        it("should return 404 Not Found when updating a square not in database", async () => {
            const cookieHeader = await getCookieHeader();
            const id = await getNonExistingSquareId();
            const response = await request(app).put(`${squareApi}/${id}`).set("Cookie", cookieHeader).send({ id, text: "bar", themeId: [] });
            expect(response.status).toEqual(404);
        });

        it("should return 400 Bad Request when non-number is used as id", async () => {
            const id = "abc";
            const response = await request(app).put(`${squareApi}/${id}`).send({ id, text: "foo", themeId: [] });
            expect(response.status).toEqual(400);
        });

        it("should return 400 Bad Request when negative number is used as id", async () => {
            const id = -1;
            const response = await request(app).put(`${squareApi}/${id}`).send({ id, text: "foo", themeId: [] });
            expect(response.status).toEqual(400);
        });

        it("should return 400 Bad Request when parameter id and body id don't match", async () => {
            const id1 = 1;
            const id2 = 2;
            const response = await request(app).put(`${squareApi}/${id1}`).send({ id: id2, text: "foo" });
            expect(response.status).toEqual(400);
        });

        it("should return 400 Bad Request when text and theme id array are missing", async () => {
            const allSquares = await getAllSquares();
            const id = allSquares[0].id;
            const response = await request(app).put(`${squareApi}/${id}`).send({ id });
            expect(response.status).toEqual(400);
        });

        it("should return 400 Bad Request when text is longer than allowed", async () => {
            const allSquares = await getAllSquares();
            const id = allSquares[1].id;
            const text = getTooLongText();
            const response = await request(app).put(`${squareApi}/${id}`).send({ id, text, themeId: [] });
            expect(response.status).toEqual(400);
        });

        it("should return 400 Bad Request when non-existing theme id is used", async () => {
            const cookieHeader = await getCookieHeader();
            const allSquares = await getAllSquares();
            const id = allSquares[0].id;
            const newThemeIds = [await getNonExistingThemeId()];
            const response = await request(app).put(`${squareApi}/${id}`).set("Cookie", cookieHeader).send({ id, themeId: newThemeIds });
            expect(response.status).toEqual(400);
        });

        it("should return 401 Unauthorized when not passing a token", async () => {
            const allSquares = await getAllSquares();
            const id = allSquares[2].id;
            const newText = "lorem ipsum dolor sit amet";
            const response = await request(app).put(`${squareApi}/${id}`).send({ id, text: newText});
            expect(response.status).toEqual(401);
        });

        it("should return 401 Unauthorized when passing an invalid token", async () => {
            const allSquares = await getAllSquares();
            const id = allSquares[2].id;
            const newText = "lorem ipsum dolor sit amet";
            const response = await request(app).put(`${squareApi}/${id}`).set("Cookie", ["token=aabbccddeeff00112233445566"]).send({ id, text: newText});
            expect(response.status).toEqual(401);
        });
    });

    describe("update square by id", () => {
        beforeEach(async () => {
            await knex.seed.run();
        });

        it("should update text for square in database", async () => {
            const cookieHeader = await getCookieHeader();
            const allSquares = await getAllSquares();
            const id = allSquares[2].id;
            const newText = "lorem ipsum dolor sit amet";
            const response = await request(app).put(`${squareApi}/${id}`).set("Cookie", cookieHeader).send({ id, text: newText});
            expect(response.status).toEqual(200);
            const receivedSquare: Square = response.body;
            expect(receivedSquare.id).toEqual(id);
            expect(receivedSquare.text).toEqual(newText);
        });

        it("should add themes for square in database", async () => {
            const cookieHeader = await getCookieHeader();
            const allSquares = await getAllSquares();
            const id = allSquares[0].id;
            const newThemeIds = (await getExistingThemeIds()).filter(x => x % 2 == 0);
            const response = await request(app).put(`${squareApi}/${id}`).set("Cookie", cookieHeader).send({ id, themeId: newThemeIds });
            expect(response.status).toEqual(200);
            const receivedSquare: Square = response.body;
            expect(receivedSquare.id).toEqual(id);
            expect(receivedSquare.themes.sort().map(x => x.id)).toEqual(newThemeIds.sort());
        });

        it("should remove themes for square in database", async () => {
            const cookieHeader = await getCookieHeader();
            const allSquares = await getAllSquares();
            const id = allSquares[0].id;
            const newThemeIds: Array<number> = [];
            const response = await request(app).put(`${squareApi}/${id}`).set("Cookie", cookieHeader).send({ id, themeId: newThemeIds });
            expect(response.status).toEqual(200);
            const receivedSquare: Square = response.body;
            expect(receivedSquare.id).toEqual(id);
            expect(receivedSquare.themes.map(x => x.id)).toEqual(newThemeIds);
        });

        it("should replace themes for square in database", async () => {
            const cookieHeader = await getCookieHeader();
            const allSquares = await getAllSquares();
            const square = allSquares[0];
            const id = square.id;
            const newThemeIds = (await getExistingThemeIds()).filter(x => !square.themes.map(t => t.id).includes(x));
            const response = await request(app).put(`${squareApi}/${id}`).set("Cookie", cookieHeader).send({ id, themeId: newThemeIds });
            expect(response.status).toEqual(200);
            const receivedSquare: Square = response.body;
            expect(receivedSquare.id).toEqual(id);
            expect(receivedSquare.themes.sort().map(x => x.id)).toEqual(newThemeIds.sort());
        });

        it("should update text and themes for square in database", async () => {
            const cookieHeader = await getCookieHeader();
            const allSquares = await getAllSquares();
            const square = allSquares[0];
            const id = square.id;
            const newThemeIds = [square.themes[0].id];
            const newText = "the new text";
            const response = await request(app).put(`${squareApi}/${id}`).set("Cookie", cookieHeader).send({ id, text: newText, themeId: newThemeIds });
            expect(response.status).toEqual(200);
            const receivedSquare: Square = response.body;
            expect(receivedSquare.id).toEqual(id);
            expect(receivedSquare.text).toEqual(newText);
            expect(receivedSquare.themes.map(x => x.id)).toEqual(newThemeIds);
        });
    });
});

describe("DELETE /api/square", () => {
    describe("validate requests", () => {
        beforeAll(async () => {
            await knex.seed.run();
        });

        it("should return 404 Not Found when updating a square not in database", async () => {
            const cookieHeader = await getCookieHeader();
            const id = await getNonExistingSquareId();
            const response = await request(app).delete(`${squareApi}/${id}`).set("Cookie", cookieHeader);
            expect(response.status).toEqual(404);
        });

        it("should return 400 Bad Request when non-number is used as id", async () => {
            const response = await request(app).delete(`${squareApi}/abc`);
            expect(response.status).toEqual(400);
        });

        it("should return 400 Bad Request when negative number is used as id", async () => {
            const response = await request(app).delete(`${squareApi}/-1`);
            expect(response.status).toEqual(400);
        });

        it("should return 401 Unauthorized when not passing a token", async () => {
            const allSquares = await getAllSquares();
            const id = allSquares[2].id;
            const response = await request(app).delete(`${squareApi}/${id}`);
            expect(response.status).toEqual(401);
        });

        it("should return 401 Unauthorized when passing an invalid token", async () => {
            const allSquares = await getAllSquares();
            const id = allSquares[3].id;
            const response = await request(app).delete(`${squareApi}/${id}`).set("Cookie", ["token=aabbccddeeff00112233445566"]);
            expect(response.status).toEqual(401);
        });

        it("should return 204 No Content on successful delete", async () => {
            const cookieHeader = await getCookieHeader();
            const allSquares = await getAllSquares();
            const id = allSquares[0].id;
            const response = await request(app).delete(`${squareApi}/${id}`).set("Cookie", cookieHeader);
            expect(response.status).toEqual(204);
        });
    });

    describe("delete a square", () => {
        beforeEach(async () => {
            await knex.seed.run();
        });

        it("the number of squares should decrease by one on successful delete", async () => {
            const cookieHeader = await getCookieHeader();
            const allSquares = await getAllSquares();
            const id = allSquares[1].id;
            const originalGetResponse = await request(app).get(squareApi);
            const deleteResponse = await request(app).delete(`${squareApi}/${id}`).set("Cookie", cookieHeader);
            const newGetResponse = await request(app).get(squareApi);
            expect(deleteResponse.status).toEqual(204);
            expect(originalGetResponse.body.length - newGetResponse.body.length).toEqual(1);
        });

        it("deleted square should not be found by id after successful delete", async () => {
            const cookieHeader = await getCookieHeader();
            const allSquares = await getAllSquares();
            const id = allSquares[2].id;
            const deleteResponse = await request(app).delete(`${squareApi}/${id}`).set("Cookie", cookieHeader);
            const getResponse = await request(app).get(`${squareApi}/${id}`);
            expect(deleteResponse.status).toEqual(204);
            expect(getResponse.status).toEqual(404);
        });
    });
});
