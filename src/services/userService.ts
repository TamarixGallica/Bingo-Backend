"use strict";

import bcrypt from "bcrypt";
import crypto from "crypto";
import { LoginUser, RegisterUser, User } from "../models";
import knex from "../config/database";
import sessionService from "./sessionService";

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
    token?: string;
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

const generateToken = async (): Promise<string> => {
    const buffer = await crypto.randomBytes(16);
    const token = buffer.toString("hex");
    return token;
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

    const token = await generateToken();

    await sessionService.addSession({ userId: userInDb.id, token });

    return {
        status: UserResponseStatus.Success_OK,
        token
    };
};

export default { getUserByUsername, addUser, loginUser };
