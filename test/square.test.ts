import request from "supertest";
import app from "../src/app";
import knex from "../src/services/knex";
import { Square } from "../src/models";
import { squareEntries } from "../db/seeds/001_squares";

const cardApi = "/api/square";

beforeAll(async () => {
    await knex.migrate.rollback(null, true);
    await knex.migrate.latest();
});

beforeEach(async () => {
    await knex.seed.run();
});

describe("GET /api/square", () => {

    describe("retrieve all squares", () => {

        it("should return 200 OK", async () => {
            const response = await request(app).get(cardApi);
            expect(response.status).toEqual(200);
        });

        it("should return json", async () => {
            const response = await request(app).get(cardApi);
            expect(response.type).toEqual("application/json");
        });

        it("should return an array", async () => {
            const response = await request(app).get(cardApi);
            expect(Array.isArray(response.body)).toEqual(true);
        });

        it("should return all squares with correct data", async () => {
            const response = await request(app).get(cardApi);
            const returnedSquares: Square[] = response.body;
            expect(returnedSquares.length).toEqual(squareEntries.length);
            for (const square of squareEntries)
            {
                const returnedSquare = returnedSquares.find(x => x.id == square.id);
                expect(returnedSquare).not.toBeNull();
                expect(returnedSquare.id).toEqual(square.id.toString());
                expect(returnedSquare.text).toEqual(square.text);
            }
        });    
    });

    describe("retrieve square by id", () => {

        it("should return 200 OK for square in database", async () => {
            const square = squareEntries[0];
            const response = await request(app).get(`${cardApi}/${square.id}`);
            expect(response.status).toEqual(200);
        });

        it("should return json for square in database", async () => {
            const square = squareEntries[0];
            const response = await request(app).get(`${cardApi}/${square.id}`);
            expect(response.type).toEqual("application/json");
        });

        it("should not return an array for a square in database", async () =>{
            const square = squareEntries[0];
            const response = await request(app).get(`${cardApi}/${square.id}`);
            expect(Array.isArray(response.body)).toEqual(false);
        });

        it("should return square with correct data", async () => {
            const square = squareEntries[0];
            const response = await request(app).get(`${cardApi}/${square.id}`);
            const receivedSquare: Square = response.body;
            expect(receivedSquare.id).toEqual(square.id.toString());
            expect(receivedSquare.text).toEqual(square.text);
        });

        it("should return 400 Bad Request when non-number is used as id", async () => {
            const response = await request(app).get(`${cardApi}/abc`);
            expect(response.status).toEqual(400);
        });

        it("should return 400 Bad Request when negative number is used as id", async () => {
            const response = await request(app).get(`${cardApi}/-4`);
            expect(response.status).toEqual(400);
        });

        it("should return 404 Not Found for square not in database", async () => {
            const id = Math.max(...squareEntries.map(x => x.id)) + 1;
            const response = await request(app).get(`${cardApi}/${id}`);
            expect(response.status).toEqual(404);
        });
    });
});
