import request from "supertest";
import { userEntries } from "../db/seeds/002_users";
import app from "../src/app";
import { Theme } from "../src/models";

export const themeApi = "/api/theme";

export const getAllThemes = async (): Promise<Theme[]> => {
    const response = await request(app).get(themeApi);
    return response.body;
};

export const getTooLongText = (): string => "".padEnd(1024, "1234567890");

export const getNonExistingThemeId = async (): Promise<number> => {
    const allThemes = await getAllThemes();
    return Math.max(...allThemes.map(x => x.id)) + 1;
};

export const getCookieHeader = async (): Promise<Array<string>> => {
    const loginRequest = {
        username: userEntries[1].username,
        password: userEntries[1].password
    };
    const loginResponse = await request(app).post("/api/user/login").send(loginRequest);
    const cookieHeader = loginResponse.header["set-cookie"];
    return cookieHeader;
};
