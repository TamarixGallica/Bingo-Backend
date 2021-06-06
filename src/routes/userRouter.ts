"use strict";

import { Request, Response } from "express";
import { RegisterUser, UserBase } from "../models";
import userService, { UserResponseStatus } from "../services/userService";

export const registerUser = async (req: Request, res: Response): Promise<void> => {
    const addUserRequest: RegisterUser = {
        username: req.body.username,
        name: req.body.name,
        password: req.body.password,
    };
    const registerResponse = await userService.addUser(addUserRequest);

    if (registerResponse.status === UserResponseStatus.Error_UsernameAlreadyTaken)
    {
        return res.status(400).end();
    }

    const userResponse: UserBase = {
        username: registerResponse.user.username,
        name: registerResponse.user.name
    };

    return res.json(userResponse).end();
};

export default { registerUser };