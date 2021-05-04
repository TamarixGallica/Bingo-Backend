import request from "supertest";
import app from "../src/app";
import knex from "../src/services/knex";
import { Theme } from "../src/models";
import { themeEntries } from "../db/seeds/002_themes";

const themeApi = "/api/theme";

beforeAll(async () => {
    await knex.migrate.rollback(null, true);
    await knex.migrate.latest();
});

beforeEach(async () => {
    await knex.seed.run();
});

describe("GET /api/theme", () => {

    describe("retrieve all themes", () => {
        
        it("should return 200 OK", async () => {
            const response = await request(app).get(themeApi);
            expect(response.status).toEqual(200);
        });

        it("should return json", async () => {
            const response = await request(app).get(themeApi);
            expect(response.type).toEqual("application/json");
        });

        it("should return an array", async () => {
            const response = await request(app).get(themeApi);
            expect(Array.isArray(response.body)).toEqual(true);
        });

        it("should return all squares with correct data", async () => {
            const response = await request(app).get(themeApi);
            const returnedThemes: Theme[] = response.body;
            expect(returnedThemes.length).toEqual(themeEntries.length);
            for (const theme of themeEntries)
            {
                const returnedTheme = returnedThemes.find(x => x.id == theme.id);
                expect(returnedTheme).not.toBeNull();
                expect(returnedTheme.id).toEqual(theme.id.toString());
                expect(returnedTheme.name).toEqual(theme.name);
            }
        });
    });

    describe("retrieve theme by id", () => {

        it("should return 200 OK for theme in database", async () => {
            const theme = themeEntries[0];
            const response = await request(app).get(`${themeApi}/${theme.id}`);
            expect(response.status).toEqual(200);
        });

        it("should return json for theme in database", async () => {
            const theme = themeEntries[0];
            const response = await request(app).get(`${themeApi}/${theme.id}`);
            expect(response.type).toEqual("application/json");
        });

        it("should return square with correct data", async () => {
            const theme = themeEntries[0];
            const response = await request(app).get(`${themeApi}/${theme.id}`);
            const receivedTheme: Theme = response.body;
            expect(receivedTheme.id).toEqual(theme.id.toString());
            expect(receivedTheme.name).toEqual(theme.name);
        });

        it("should return 400 Bad Request when non-number is used as id", async () => {
            const response = await request(app).get(`${themeApi}/foobar`);
            expect(response.status).toEqual(400);
        });

        it("should return 400 Bad Request when negative number is used as id", async () => {
            const response = await request(app).get(`${themeApi}/-9`);
            expect(response.status).toEqual(400);
        });

        it("should return 404 Not Found for theme not in database", async () => {
            const id = Math.max(...themeEntries.map(x => x.id)) + 1;
            const response = await request(app).get(`${themeApi}/${id}`);
            expect(response.status).toEqual(404);
        });
    });
});
