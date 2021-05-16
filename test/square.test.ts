import request from "supertest";
import app from "../src/app";
import knex from "../src/services/knexService";
import { Square } from "../src/models";
import { squareEntries } from "../db/seeds/001_squares_and_themes";

const squareApi = "/api/square";

beforeAll(async () => {
    await knex.migrate.rollback(null, true);
    await knex.migrate.latest();
});

beforeEach(async () => {
    await knex.seed.run();
});

const getNonExistingSquareId = () => Math.max(...squareEntries.map(x => x.id)) + 1;

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

        it("should return all squares with correct data", async () => {
            const response = await request(app).get(squareApi);
            const returnedSquares: Square[] = response.body;
            expect(returnedSquares.length).toEqual(squareEntries.length);
            for (const square of squareEntries)
            {
                const returnedSquare = returnedSquares.find(x => x.id == square.id);
                expect(returnedSquare).not.toBeNull();
                expect(returnedSquare.id).toEqual(square.id);
                expect(returnedSquare.text).toEqual(square.text);
                expect(Array.isArray(returnedSquare.themes)).toEqual(true);
                expect(returnedSquare.themes.length).toEqual(square.themes.length);
                square.themes.forEach((theme) => {
                    const returnedTheme = returnedSquare.themes.find((t) => t.id == theme.id);
                    expect(returnedTheme.id).toEqual(theme.id);
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
            const square = squareEntries[0];
            const response = await request(app).get(`${squareApi}/${square.id}`);
            expect(response.status).toEqual(200);
        });

        it("should return json for square in database", async () => {
            const square = squareEntries[0];
            const response = await request(app).get(`${squareApi}/${square.id}`);
            expect(response.type).toEqual("application/json");
        });

        it("should not return an array for a square in database", async () =>{
            const square = squareEntries[0];
            const response = await request(app).get(`${squareApi}/${square.id}`);
            expect(Array.isArray(response.body)).toEqual(false);
        });

        it("should return square with correct data", async () => {
            const square = squareEntries[0];
            const response = await request(app).get(`${squareApi}/${square.id}`);
            const receivedSquare: Square = response.body;
            expect(receivedSquare.id).toEqual(square.id);
            expect(receivedSquare.text).toEqual(square.text);
            expect(Array.isArray(receivedSquare.themes)).toEqual(true);
            expect(receivedSquare.themes.length).toEqual(square.themes.length);
            square.themes.forEach((theme) => {
                const returnedTheme = receivedSquare.themes.find((t) => t.id == theme.id);
                expect(returnedTheme.id).toEqual(theme.id);
                expect(returnedTheme.name).toEqual(theme.name);
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
            const id = getNonExistingSquareId();
            const response = await request(app).get(`${squareApi}/${id}`);
            expect(response.status).toEqual(404);
        });
    });
});

describe("PUT /api/square", () => {

    describe("update square by id", () => {

        it("should return 404 Not Found when updating a square not in database", async () => {
            const id = getNonExistingSquareId();
            const response = await request(app).put(squareApi).send({ id, text: "bar" });
            expect(response.status).toEqual(404);
        });

        it("should return 400 Bad Request when non-number is used as id", async () => {
            const response = await request(app).put(squareApi).send({ id: "abc", text: "foo" });
            expect(response.status).toEqual(400);
        });

        it("should return 400 Bad Request when negative number is used as id", async () => {
            const response = await request(app).put(squareApi).send({ id: -1, text: "foo" });
            expect(response.status).toEqual(400);
        });

        it("should return 400 Bad Request when text is missing", async () => {
            const response = await request(app).put(squareApi).send({ id: squareEntries[0].id });
            expect(response.status).toEqual(400);
        });

        it("should return 400 Bad Request when text is longer than allowed", async () => {
            const text = "".padEnd(1024, "1234567890");
            const response = await request(app).put(squareApi).send({ id: squareEntries[0].id, text });
            expect(response.status).toEqual(400);
        });

        it("should update text for square in database", async () => {
            const square = squareEntries[1];
            const newText = "lorem ipsum dolor sit amet";
            const response = await request(app).put(squareApi).send({ id: square.id, text:  newText});
            expect(response.status).toEqual(200);
            const receivedSquare: Square = response.body;
            expect(receivedSquare.id).toEqual(square.id);
            expect(receivedSquare.text).toEqual(newText);
        });
    });
});
