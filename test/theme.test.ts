import request from "supertest";
import app from "../src/app";
import knex from "../src/services/knexService";
import { Theme } from "../src/models";
import { themeEntries } from "../db/seeds/001_squares_and_themes";
import { getAllThemes, getNonExistingThemeId, getTooLongText, themeApi } from "./shared";

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

        it("should return all themes with expected names", async () => {
            const response = await request(app).get(themeApi);
            const returnedThemes: Theme[] = response.body;
            expect(returnedThemes.length).toEqual(themeEntries.length);
            for (const theme of themeEntries)
            {
                const returnedTheme = returnedThemes.find(x => x.name == theme.name);
                expect(returnedTheme).not.toBeUndefined();
            }
        });
    });

    describe("filter based on text", () => {

        it("should allow only a string as a name filter", async () => {
            const response1 = await request(app).get(themeApi).query({ name: ["foo", "bar"]});
            expect(response1.status).toEqual(400);

            const response2 = await request(app).get(`${themeApi}?name=foo&text=bar`);
            expect(response2.status).toEqual(400);

            const response3 = await request(app).get(themeApi).query({ name: { foo: "foo", bar: "bar"}});
            expect(response3.status).toEqual(400);

            const response4 = await request(app).get(`${themeApi}?name=`);
            expect(response4.status).toEqual(400);

            const response5 = await request(app).get(themeApi).query({ name: "foo"});
            expect(response5.status).toEqual(200);
        });

        it("should return specific theme with full text", async () => {
            const response = await request(app).get(themeApi).query({name: themeEntries[0].name});
            const returnedThemes: Theme[] = response.body;
            expect(response.status).toEqual(200);
            expect(returnedThemes.length).toEqual(1);
        });

        it("should return expected number of results with a single word", async () => {
            const verifyNumberOfResult = async (name: string) => {
                const matchingThemes = themeEntries.filter(t => t.name.toLowerCase().includes(name));
                const response = await request(app).get(themeApi).query({name});
                const returnedThemes: Theme[] = response.body;
                expect(response.status).toEqual(200);
                expect(returnedThemes.length).toEqual(matchingThemes.length);
            };

            await verifyNumberOfResult("the");
            await verifyNumberOfResult("90");
            await verifyNumberOfResult("m");
        });
    });

    describe("retrieve theme by id", () => {

        it("should return 200 OK for theme in database", async () => {
            const allThemes = await getAllThemes();
            const theme = allThemes[0];
            const response = await request(app).get(`${themeApi}/${theme.id}`);
            expect(response.status).toEqual(200);
        });

        it("should return json for theme in database", async () => {
            const allThemes = await getAllThemes();
            const theme = allThemes[1];
            const response = await request(app).get(`${themeApi}/${theme.id}`);
            expect(response.type).toEqual("application/json");
        });

        it("should return theme with correct data", async () => {
            const allThemes = await getAllThemes();
            const theme = allThemes[2];
            const response = await request(app).get(`${themeApi}/${theme.id}`);
            const receivedTheme: Theme = response.body;
            expect(receivedTheme.id).toEqual(theme.id);
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
            const allThemes = await getAllThemes();
            const id = Math.max(...allThemes.map(x => x.id)) + 1;
            const response = await request(app).get(`${themeApi}/${id}`);
            expect(response.status).toEqual(404);
        });
    });
});

describe("POST /api/theme", () => {

    describe("validate requests", () => {

        it("should return 400 Bad Request when using an empty body", async () => {
            const response = await request(app).post(themeApi).send();
            expect(response.status).toEqual(400);
        });

        it("should return 400 Bad Request when supplying id and name", async () => {
            const response = await request(app).post(themeApi).send({ id: 1, name: "foo" });
            expect(response.status).toEqual(400);
        });

        it("should return 400 Bad Request when name is undefined", async () => {
            const response = await request(app).post(themeApi).send({ name: undefined });
            expect(response.status).toEqual(400);
        });

        it("should return 400 Bad Request when name is longer than allowed", async () => {
            const name = getTooLongText();
            const response = await request(app).post(themeApi).send({ name });
            expect(response.status).toEqual(400);
        });

        it("should return 200 when text is supplied", async () => {
            const response = await request(app).post(themeApi).send({ name: "foo" });
            expect(response.status).toEqual(200);
        });
    });

    describe("add a theme", () => {

        it("should add a theme with name", async () => {
            const name = "testing";
            const response = await request(app).post(themeApi).send({ name });
            const theme: Theme = response.body;
            expect(response.status).toEqual(200);
            expect(Number.isInteger(theme.id)).toEqual(true);
            expect(theme.name).toEqual(name);
        });

        it("added theme should appear in the list of themes after adding", async () => {
            const name = "testing is fun";

            const addResponse = await request(app).post(themeApi).send({ name });
            const id = addResponse.body.id;
            expect(addResponse.status).toEqual(200);

            const getResponse = await request(app).get(themeApi);
            const themes: Theme[] = getResponse.body;
            const addedTheme = themes.find(x => x.name === name);
            expect(addedTheme.id).toEqual(id);
            expect(addedTheme.name).toEqual(name);
        });
    });
});

describe("PUT /api/theme", () => {

    describe("validate requests", () => {

        it("should return 404 Not Found when updating a theme not in database", async () => {
            const id = await getNonExistingThemeId();
            const theme: Theme = { id, name: "bar" };
            const response = await request(app).put(`${themeApi}/${theme.id}`).send(theme);
            expect(response.status).toEqual(404);
        });

        it("should return 400 Bad Request when non-number is used as id", async () => {
            interface ThemeWithStringId extends Omit<Theme, "id"> { id: string }
            const theme: ThemeWithStringId = {
                id: "abc",
                name: "foo"
            };
            const response = await request(app).put(`${themeApi}/${theme.id}`).send(theme);
            expect(response.status).toEqual(400);
        });

        it("should return 400 Bad Request when negative number is used as id", async () => {
            const theme: Theme = {
                id: -1,
                name: "bar"
            };
            const response = await request(app).put(`${themeApi}/${theme.id}`).send(theme);
            expect(response.status).toEqual(400);
        });

        it("should return 400 Bad Request when parameter id and body id don't match", async () => {
            const id1 = 1;
            const id2 = 2;
            const response = await request(app).put(`${themeApi}/${id1}`).send({ id: id2, text: "foo" });
            expect(response.status).toEqual(400);
        });

        it("should return 400 Bad Request when name is missing", async () => {
            const theme: Omit<Theme, "name"> = {
                id: (await getAllThemes())[0].id
            };
            const response = await request(app).put(`${themeApi}/${theme.id}`).send(theme);
            expect(response.status).toEqual(400);
        });

        it("should return 400 Bad Request when name is longer than allowed", async () => {
            const theme: Theme = {
                id: (await getAllThemes())[2].id,
                name: getTooLongText()
            };
            const response = await request(app).put(`${themeApi}/${theme.id}`).send(theme);
            expect(response.status).toEqual(400);
        });
    });

    describe("update theme by id", () => {

        it("should update name for theme in database", async () => {
            const allThemes = await getAllThemes();
            const theme = allThemes[1];
            const newName = "Theme 2.0";
            const response = await request(app).put(`${themeApi}/${theme.id}`).send({ id: theme.id, name:  newName});
            expect(response.status).toEqual(200);
            const receivedTheme: Theme = response.body;
            expect(receivedTheme.id).toEqual(theme.id);
            expect(receivedTheme.name).toEqual(newName);
        });
    });
});

describe("DELETE /api/theme", () => {

    describe("validate requests", () => {

        it("should return 404 Not Found when updating a theme not in database", async () => {
            const id = await getNonExistingThemeId();
            const response = await request(app).delete(`${themeApi}/${id}`);
            expect(response.status).toEqual(404);
        });

        it("should return 400 Bad Request when non-number is used as id", async () => {
            const response = await request(app).delete(`${themeApi}/abc`);
            expect(response.status).toEqual(400);
        });

        it("should return 400 Bad Request when negative number is used as id", async () => {
            const response = await request(app).delete(`${themeApi}/-1`);
            expect(response.status).toEqual(400);
        });

        it("should return 204 No Content on successful delete", async () => {
            const allThemes = await getAllThemes();
            const id = allThemes[2].id;
            const response = await request(app).delete(`${themeApi}/${id}`);
            expect(response.status).toEqual(204);
        });
    });

    describe("delete a theme", () => {

        it("the number of themes should decrease by one on successful delete", async () => {
            const allThemes = await getAllThemes();
            const id = allThemes[2].id;
            const originalGetResponse = await request(app).get(themeApi);
            const deleteResponse = await request(app).delete(`${themeApi}/${id}`);
            const newGetResponse = await request(app).get(themeApi);
            expect(deleteResponse.status).toEqual(204);
            expect(originalGetResponse.body.length - newGetResponse.body.length).toEqual(1);
        });

        it("deleted theme should not be found by id after successful delete", async () => {
            const allThemes = await getAllThemes();
            const id = allThemes[2].id;
            const deleteResponse = await request(app).delete(`${themeApi}/${id}`);
            const getResponse = await request(app).get(`${themeApi}/${id}`);
            expect(deleteResponse.status).toEqual(204);
            expect(getResponse.status).toEqual(404);
        });

    });
});