"use strict";

interface Password {
    password: string;
}

export interface UserBase {
    username: string;
    name: string;
}

export type LoginUser = Omit<UserBase, "name"> & Password;

export interface User extends UserBase {
    id: number;
    hash: string;
}
