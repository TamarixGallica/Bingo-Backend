"use strict";

import { Session } from "../models/sessionModel";
import knex from "../config/database";

interface AddSessionRequest {
    userId: number;
    token: string;
}

const sessionTableName = "sessions";

export const getSessionByToken = async (token: string): Promise<Session | undefined> => {
    const userId = await knex(sessionTableName).first("user_id").where("token", token);
    return userId;
};

export const addSession = async (request: AddSessionRequest): Promise<void> => {
    await knex(sessionTableName).insert({ "user_id": request.userId, token: request.token});
};

export default { getSessionByToken, addSession };
