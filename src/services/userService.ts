"use strict";

import bcrypt from "bcrypt";
import { LoginUser, RegisterUser, User } from "../models";
import knex from "../config/database";

export enum UserResponseStatus {
    Success_OK,
    Error_UsernameAlreadyTaken,
    Error_UserNotFound,
    Error_PasswordIncorrect,
}

export interface AddUserResponse {
    status: UserResponseStatus;
    user?: User;
}

export interface LoginUserResponse {
    status: UserResponseStatus;
}

const userTableName = "users";
const returnedProps = ["id", "username", "name", "hash"];

const hashPassword = async (password: string): Promise<string> => {
    const hash = await bcrypt.hash(password, 12);
    return hash;
};

const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
    const result = await bcrypt.compare(password, hash);
    return result;
};

export const getUserByUsername = async (username: string): Promise<User | undefined> => 
{
    const query = knex.first(returnedProps)
        .from<User>(userTableName)
        .where("username", username);

    const user = await query;
    return user;
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

export const loginUser = async (user: LoginUser): Promise<LoginUserResponse> => {
    const userInDb = await getUserByUsername(user.username);

    if (!userInDb)
    {
        return {
            status: UserResponseStatus.Error_UserNotFound
        };
    }

    const passwordMatches = await verifyPassword(user.password, userInDb.hash);

    if (!passwordMatches)
    {
        return {
            status: UserResponseStatus.Error_PasswordIncorrect
        };
    }

    return {
        status: UserResponseStatus.Success_OK
    };
};

export default { getUserByUsername, addUser, loginUser };
