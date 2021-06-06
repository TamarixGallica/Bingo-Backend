"use strict";

export interface UserBase {
    username: string;
    name: string;
}

export interface RegisterUser extends UserBase {
    password: string;
}

export interface User extends UserBase {
    id: number;
    hash: string;
}
