import request from "supertest";
import { userEntries } from "../db/seeds/002_users";
import app from "../src/app";
import knex from "../src/config/database";
import { getTooLongText } from "./shared";

const userApi = "/api/user";
const userApiRegister = `${userApi}/register`;
const userApiLogin = `${userApi}/login`;

beforeAll(async () => {
    await knex.migrate.rollback(null, true);
    await knex.migrate.latest();
    await knex.seed.run();
});

interface RegistrationRequest {
    username: string;
    name: string;
    password: string;
}

type LoginRequest = Omit<RegistrationRequest, "name">;

const getBasicRegistrationRequest = (): RegistrationRequest => ({
    username: "jillvalentine",
    name: "Jill Valentine",
    password: "JillRules123"
});

describe("POST /api/user/register", () => {
    describe("validate requests", () => {
        afterAll(async () => {
            await knex.seed.run();
        });

        it("should return 400 Bad Request when username is missing", async () => {
            const registrationRequest = getBasicRegistrationRequest();
            delete registrationRequest.username;
            const response = await request(app).post(userApiRegister).send(registrationRequest);
            expect(response.status).toEqual(400);
        });

        it("should return 400 Bad Request when username is too short", async () => {
            const registrationRequest = getBasicRegistrationRequest();
            registrationRequest.username = "";
            const response = await request(app).post(userApiRegister).send(registrationRequest);
            expect(response.status).toEqual(400);
        });

        it("should return 400 Bad Request when username is too long", async () => {
            const registrationRequest = getBasicRegistrationRequest();
            registrationRequest.username = getTooLongText();
            const response = await request(app).post(userApiRegister).send(registrationRequest);
            expect(response.status).toEqual(400);
        });

        it("should return 400 Bad Request when username contains illegal characters", async () => {
            const registrationRequest = getBasicRegistrationRequest();
            registrationRequest.username = "jill/valentine";
            const response = await request(app).post(userApiRegister).send(registrationRequest);
            expect(response.status).toEqual(400);
        });

        it("should return 400 Bad Request when name is missing", async () => {
            const registrationRequest = getBasicRegistrationRequest();
            delete registrationRequest.name;
            const response = await request(app).post(userApiRegister).send(registrationRequest);
            expect(response.status).toEqual(400);
        });

        it("should return 400 Bad Request when name is too short", async () => {
            const registrationRequest = getBasicRegistrationRequest();
            registrationRequest.name = "";
            const response = await request(app).post(userApiRegister).send(registrationRequest);
            expect(response.status).toEqual(400);
        });

        it("should return 400 Bad Request when name is too long", async () => {
            const registrationRequest = getBasicRegistrationRequest();
            registrationRequest.name = getTooLongText();
            const response = await request(app).post(userApiRegister).send(registrationRequest);
            expect(response.status).toEqual(400);
        });

        it("should return 400 Bad Request when password is missing", async () => {
            const registrationRequest = getBasicRegistrationRequest();
            delete registrationRequest.password;
            const response = await request(app).post(userApiRegister).send(registrationRequest);
            expect(response.status).toEqual(400);
        });
    
        it("should return 400 Bad Request when password is too short", async () => {
            const registrationRequest = getBasicRegistrationRequest();
            registrationRequest.password = "Jill";
            const response = await request(app).post(userApiRegister).send(registrationRequest);
            expect(response.status).toEqual(400);
        });

        it("should return 400 Bad Request when defined username is already taken", async () => {
            const registrationRequest = getBasicRegistrationRequest();
            registrationRequest.username = userEntries[0].username;
            const response = await request(app).post(userApiRegister).send(registrationRequest);
            expect(response.status).toEqual(400);
        });

        it("should return 200 OK when valid request is sent", async () => {
            const registrationRequest = getBasicRegistrationRequest();
            const response = await request(app).post(userApiRegister).send(registrationRequest);
            expect(response.status).toEqual(200);
        });
    });

    describe("register an user", () => {
        afterEach(async () => {
            await knex.seed.run();
        });

        it("should return registered details", async () => {
            const registrationRequest = getBasicRegistrationRequest();
            const response = await request(app).post(userApiRegister).send(registrationRequest);
            const user = response.body;
            expect(user.username).toEqual(registrationRequest.username);
            expect(user.name).toEqual(registrationRequest.name);
        });
    });
});

describe("POST /api/user/login", () => {
    describe("validate requests", () => {
        it("should return 400 Bad Request when username is missing", async () => {
            const loginRequest: Partial<LoginRequest> = {
                password: userEntries[0].password
            };
            const response = await request(app).post(userApiLogin).send(loginRequest);
            expect(response.status).toEqual(400);
        });

        it("should return 400 Bad Request when username is too short", async () => {
            const loginRequest: LoginRequest = {
                username: "",
                password: userEntries[0].password
            };
            const response = await request(app).post(userApiLogin).send(loginRequest);
            expect(response.status).toEqual(400);
        });

        it("should return 400 Bad Request when username is too long", async () => {
            const loginRequest: LoginRequest = {
                username: getTooLongText(),
                password: userEntries[0].password
            };
            const response = await request(app).post(userApiLogin).send(loginRequest);
            expect(response.status).toEqual(400);
        });

        it("should return 400 Bad Request when username contains illegal characters", async () => {
            const loginRequest: LoginRequest = {
                username: "brian?kottarainen",
                password: userEntries[0].password
            };
            const response = await request(app).post(userApiLogin).send(loginRequest);
            expect(response.status).toEqual(400);
        });

        it("should return 400 Bad Request when password is missing", async () => {
            const loginRequest: Partial<LoginRequest> = {
                username: "brian?kottarainen"
            };
            const response = await request(app).post(userApiLogin).send(loginRequest);
            expect(response.status).toEqual(400);
        });
    
        it("should return 400 Bad Request when password is too short", async () => {
            const loginRequest: LoginRequest = {
                username: userEntries[0].username,
                password: "123"
            };
            const response = await request(app).post(userApiLogin).send(loginRequest);
            expect(response.status).toEqual(400);
        });

        it("should return 401 Unauthorized when using non-existing username", async () => {
            const loginRequest: LoginRequest = {
                username: getBasicRegistrationRequest().username,
                password: userEntries[1].password
            };
            const response = await request(app).post(userApiLogin).send(loginRequest);
            expect(response.status).toEqual(401);
        });

        it("should return 401 Unauthorized when using incorrect credentials", async () => {
            const loginRequest: LoginRequest = {
                username: userEntries[0].username,
                password: userEntries[1].password
            };
            const response = await request(app).post(userApiLogin).send(loginRequest);
            expect(response.status).toEqual(401);
        });

        it("should return 200 OK when valid request is sent", async () => {
            const loginRequest: LoginRequest = {
                username: userEntries[0].username,
                password: userEntries[0].password
            };
            const response = await request(app).post(userApiLogin).send(loginRequest);
            expect(response.status).toEqual(200);
        });
    });
});