"use strict";

import knex from "../config/database";
import { User } from "../models";

export type AddUser = Pick<User, "username"|"name"|"hash">;

const userTableName = "users";
const returnedProps = ["id", "username", "name", "hash"];

const getUserByUsername = async (username: string): Promise<User | undefined> => 
{
    const query = knex.first(returnedProps)
        .from<User>(userTableName)
        .where("username", username);

    const user = await query;
    return user;
};

const addUser = async (addUser: AddUser): Promise<User> => {
    const user = await knex<User>(userTableName).insert(addUser).returning(returnedProps);
    return user[0];
};

export default { addUser, getUserByUsername };
