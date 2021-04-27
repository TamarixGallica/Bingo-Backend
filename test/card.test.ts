import request from "supertest";
import app from "../src/app";
import knex from "../src/services/knex";
import { Card } from "../src/models";
import { cardEntries } from "../db/seeds/001_cards";

beforeAll(async () => {
    await knex.migrate.rollback();
    await knex.migrate.latest();
});

beforeEach(async () => {
    await knex.seed.run();
});

describe("GET /api/cards", () => {

    describe("retrieve all cards", () => {

        it("should return 200 OK", async () => {
            const response = await request(app).get("/api/card");
            expect(response.status).toEqual(200);
        });

        it("should return json", async () => {
            const response = await request(app).get("/api/card");
            expect(response.type).toEqual("application/json");
        });

        it("should return an array", async () => {
            const response = await request(app).get("/api/card");
            expect(Array.isArray(response.body)).toEqual(true);
        });

        it("should return all cards with correct data", async () => {
            const response = await request(app).get("/api/card");
            const returnedCards: Card[] = response.body;
            expect(returnedCards.length).toEqual(cardEntries.length);
            for (const card of cardEntries)
            {
                const returnedCard = returnedCards.find(x => x.id == card.id);
                expect(returnedCard).not.toBeNull();
                expect(returnedCard.id).toEqual(card.id.toString());
                expect(returnedCard.text).toEqual(card.text);
            }
        });    
    });

    describe("retrieve card by id", () => {

        it("should return 200 OK for card in database", async () => {
            const card = cardEntries[0];
            const response = await request(app).get("/api/card").query({ id: card.id});
            expect(response.status).toEqual(200);
        });

        it("should return json for card in database", async () => {
            const card = cardEntries[0];
            const response = await request(app).get("/api/card").query({ id: card.id});
            expect(response.type).toEqual("application/json");
        });

        it("should not return an array for a card in database", async () =>{
            const card = cardEntries[0];
            const response = await request(app).get("/api/card/:id").query({ id: card.id});
            expect(Array.isArray(response.body)).toEqual(false);
        });

        it("should return card with correct data", async () => {
            const card = cardEntries[0];
            const response = await request(app).get(`/api/card/${card.id}`);
            const receivedCard: Card = response.body;
            expect(receivedCard.id).toEqual(card.id.toString());
            expect(receivedCard.text).toEqual(card.text);
        });

        it("should return 400 Bad Request when non-number is used as id", async () => {
            const response = await request(app).get("/api/card/abc");
            expect(response.status).toEqual(400);
        });

        it("should return 404 Not Found for card not in database", async () => {
            const id = Math.max(...cardEntries.map(x => x.id)) + 1;
            const response = await request(app).get(`/api/card/${id}`);
            expect(response.status).toEqual(404);
        });
    });
});
