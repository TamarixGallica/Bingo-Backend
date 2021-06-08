"use strict";

import bcrypt from "bcrypt";
import crypto from "crypto";
import { LoginUser, User } from "../models";
import sessionService from "./sessionService";
import userRepo, { AddUser } from "../repositories/userRepo";

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

export type RegisterUser = Pick<User, "username"|"name"> & {
    password: string;
};

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

export const registerUser = async (user: RegisterUser): Promise<AddUserResponse> => {
    const usernameTaken = await userRepo.getUserByUsername(user.username);
    if (usernameTaken)
    {
        return {
            status: UserResponseStatus.Error_UsernameAlreadyTaken
        };
    }

    const hash = await hashPassword(user.password);

    const userToAdd: AddUser = {
        username: user.username,
        name: user.name,
        hash,
    };

    const addedUser = await userRepo.addUser(userToAdd);

    return {
        status: UserResponseStatus.Success_OK,
        user: addedUser
    };
};

export const loginUser = async (user: LoginUser): Promise<LoginUserResponse> => {
    const userInDb = await userRepo.getUserByUsername(user.username);

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

export default { registerUser, loginUser };
