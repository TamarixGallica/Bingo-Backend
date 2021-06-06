"use strict";

import bcrypt from "bcrypt";
import { RegisterUser, User } from "../models";
import knex from "../config/database";

export enum UserResponseStatus {
    Success_OK,
    Error_UsernameAlreadyTaken,
}

export interface AddUserResponse {
    status: UserResponseStatus;
    user?: User;
}

const userTableName = "users";
const returnedProps = ["id", "username", "name", "hash"];

const hashPassword = async (password: string): Promise<string> => {
    const hash = await bcrypt.hash(password, 12);
    return hash;
};

export const getUserByUsername = async (username: string): Promise<User | undefined> => 
{
    const query = knex.select(returnedProps)
        .from<User>(userTableName)
        .where("username", username);

    const users = await query;

    if (users.length === 0)
    {
        return undefined;
    }
    return users[0];
};

export const addUser = async (user: RegisterUser): Promise<AddUserResponse> => {
    const usernameTaken = await getUserByUsername(user.username);
    if (usernameTaken)
    {
        return {
            status: UserResponseStatus.Error_UsernameAlreadyTaken
        };
    }

    const hash = await hashPassword(user.password);

    const userToAdd = {
        username: user.username,
        name: user.name,
        hash,
    };

    const addedUsers = await knex<User>(userTableName).insert(userToAdd).returning(returnedProps);

    return {
        status: UserResponseStatus.Success_OK,
        user: addedUsers[0]
    };
};

export default { getUserByUsername, addUser };
