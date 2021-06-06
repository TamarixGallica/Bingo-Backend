"use strict";

import knex from "../config/database";

interface AddSessionRequest {
    userId: number;
    token: string;
}

const sessionTableName = "sessions";

export const addSession = async (request: AddSessionRequest): Promise<void> => {
    await knex(sessionTableName).insert({ "user_id": request.userId, token: request.token});
};

export default { addSession };
