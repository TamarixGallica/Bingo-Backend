import request from "supertest";
import app from "../src/app";
import knex from "../src/services/knexService";
import { Square, Theme } from "../src/models";
import { squareEntries, themeEntries } from "../db/seeds/001_squares_and_themes";
import { getAllThemes, getNonExistingThemeId, getTooLongText } from "./shared";

const squareApi = "/api/square";

beforeAll(async () => {
    await knex.migrate.rollback(null, true);
    await knex.migrate.latest();
});

beforeEach(async () => {
    await knex.seed.run();
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
            const response = await request(app).get(squareApi).query({text: "the"});
            const returnedSquares: Square[] = response.body;
            expect(response.status).toEqual(200);
            expect(returnedSquares.length).toEqual(3);

            const response2 = await request(app).get(squareApi).query({text: "lose"});
            const returnedSquares2: Square[] = response2.body;
            expect(response2.status).toEqual(200);
            expect(returnedSquares2.length).toEqual(1);

            const response3 = await request(app).get(squareApi).query({text: "on"});
            const returnedSquares3: Square[] = response3.body;
            expect(response3.status).toEqual(200);
            expect(returnedSquares3.length).toEqual(2);
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
            const themeId = await getNonExistingThemeId();
            const response = await request(app).post(squareApi).send({ text: "foo", themeId: [themeId] });
            expect(response.status).toEqual(400);
        });

        it("should return 200 when text is supplied", async () => {
            const response = await request(app).post(squareApi).send({ text: "foo" });
            expect(response.status).toEqual(200);
        });

        it("should return 200 when text and existing theme ids are supplied", async () => {
            const themeIds = await getExistingThemeIds();
            const response = await request(app).post(squareApi).send({ text: "foo", themeId: themeIds });
            expect(response.status).toEqual(200);
        });
    });

    describe("add a square", () => {

        it("should add a square without theme id array", async () => {
            const text = "foobar";
            const response = await request(app).post(squareApi).send({ text });
            expect(response.status).toEqual(200);
            const receivedSquare: Square = response.body;
            expect(Number.isInteger(receivedSquare.id)).toEqual(true);
            expect(receivedSquare.text).toEqual(text);
            expect(receivedSquare.themes.length).toEqual(0);
        });

        it("should add a square with empty theme id array", async () => {
            const text = "tinstafl";
            const response = await request(app).post(squareApi).send({ text, themeId: [] });
            expect(response.status).toEqual(200);
            const receivedSquare: Square = response.body;
            expect(Number.isInteger(receivedSquare.id)).toEqual(true);
            expect(receivedSquare.text).toEqual(text);
            expect(receivedSquare.themes.length).toEqual(0);
        });

        it("should add a square with a single theme id", async () => {
            const text = "tinstafl";
            const themeIds = (await getExistingThemeIds()).slice(-1, 1);
            const response = await request(app).post(squareApi).send({ text, themeId: themeIds });
            expect(response.status).toEqual(200);
            const receivedSquare: Square = response.body;
            expect(Number.isInteger(receivedSquare.id)).toEqual(true);
            expect(receivedSquare.text).toEqual(text);
            expect(receivedSquare.themes).toEqual(themeEntries.filter(t => themeIds.includes(t.id)));
        });

        it("should add a square with multiple theme ids", async () => {
            const text = "tinstafl";
            const themeIds = (await getExistingThemeIds()).slice(0, 2);
            const response = await request(app).post(squareApi).send({ text, themeId: themeIds });
            expect(response.status).toEqual(200);
            const receivedSquare: Square = response.body;
            expect(Number.isInteger(receivedSquare.id)).toEqual(true);
            expect(receivedSquare.text).toEqual(text);
            expect(receivedSquare.themes).toEqual(themeEntries.filter(t => themeIds.includes(t.id)));
        });
    });
});

describe("PUT /api/square", () => {

    describe("validate requests", () => {

        it("should return 404 Not Found when updating a square not in database", async () => {
            const id = await getNonExistingSquareId();
            const response = await request(app).put(`${squareApi}/${id}`).send({ id, text: "bar", themeId: [] });
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
            const allSquares = await getAllSquares();
            const id = allSquares[0].id;
            const newThemeIds = [await getNonExistingThemeId()];
            const response = await request(app).put(`${squareApi}/${id}`).send({ id, themeId: newThemeIds });
            expect(response.status).toEqual(400);
        });
    });

    describe("update square by id", () => {

        it("should update text for square in database", async () => {
            const allSquares = await getAllSquares();
            const id = allSquares[2].id;
            const newText = "lorem ipsum dolor sit amet";
            const response = await request(app).put(`${squareApi}/${id}`).send({ id, text: newText});
            expect(response.status).toEqual(200);
            const receivedSquare: Square = response.body;
            expect(receivedSquare.id).toEqual(id);
            expect(receivedSquare.text).toEqual(newText);
        });

        it("should add themes for square in database", async () => {
            const allSquares = await getAllSquares();
            const id = allSquares[0].id;
            const newThemeIds = (await getExistingThemeIds()).filter(x => x % 2 == 0);
            const response = await request(app).put(`${squareApi}/${id}`).send({ id, themeId: newThemeIds });
            expect(response.status).toEqual(200);
            const receivedSquare: Square = response.body;
            expect(receivedSquare.id).toEqual(id);
            expect(receivedSquare.themes.map(x => x.id)).toEqual(newThemeIds);
        });

        it("should remove themes for square in database", async () => {
            const allSquares = await getAllSquares();
            const id = allSquares[0].id;
            const newThemeIds = [];
            const response = await request(app).put(`${squareApi}/${id}`).send({ id, themeId: newThemeIds });
            expect(response.status).toEqual(200);
            const receivedSquare: Square = response.body;
            expect(receivedSquare.id).toEqual(id);
            expect(receivedSquare.themes.map(x => x.id)).toEqual(newThemeIds);
        });

        it("should replace themes for square in database", async () => {
            const allSquares = await getAllSquares();
            const square = allSquares[0];
            const id = square.id;
            const newThemeIds = (await getExistingThemeIds()).filter(x => !square.themes.map(t => t.id).includes(x));
            const response = await request(app).put(`${squareApi}/${id}`).send({ id, themeId: newThemeIds });
            expect(response.status).toEqual(200);
            const receivedSquare: Square = response.body;
            expect(receivedSquare.id).toEqual(id);
            expect(receivedSquare.themes.map(x => x.id)).toEqual(newThemeIds);
        });

        it("should update text and themes for square in database", async () => {
            const allSquares = await getAllSquares();
            const square = allSquares[0];
            const id = square.id;
            const newThemeIds = [square.themes[0].id];
            const newText = "the new text";
            const response = await request(app).put(`${squareApi}/${id}`).send({ id, text: newText, themeId: newThemeIds });
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

        it("should return 404 Not Found when updating a square not in database", async () => {
            const id = await getNonExistingSquareId();
            const response = await request(app).delete(`${squareApi}/${id}`);
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

        it("should return 204 No Content on successful delete", async () => {
            const allSquares = await getAllSquares();
            const id = allSquares[0].id;
            const response = await request(app).delete(`${squareApi}/${id}`);
            expect(response.status).toEqual(204);
        });
    });

    describe("delete a square", () => {

        it("the number of squares should decrease by one on successful delete", async () => {
            const allSquares = await getAllSquares();
            const id = allSquares[1].id;
            const originalGetResponse = await request(app).get(squareApi);
            const deleteResponse = await request(app).delete(`${squareApi}/${id}`);
            const newGetResponse = await request(app).get(squareApi);
            expect(deleteResponse.status).toEqual(204);
            expect(originalGetResponse.body.length - newGetResponse.body.length).toEqual(1);
        });

        it("deleted square should not be found by id after successful delete", async () => {
            const allSquares = await getAllSquares();
            const id = allSquares[2].id;
            const deleteResponse = await request(app).delete(`${squareApi}/${id}`);
            const getResponse = await request(app).get(`${squareApi}/${id}`);
            expect(deleteResponse.status).toEqual(204);
            expect(getResponse.status).toEqual(404);
        });

    });
});
