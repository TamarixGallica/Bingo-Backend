import { Knex } from "knex";
import dotenv from "dotenv";
import { User } from "../../src/models";

const userTable = "users";

type NewUser = Omit<User, "id"> & {
    password: string;
}

export const userEntries: NewUser[] = [
    {
        username: "brian",
        name: "Brian Kottarainen",
        password: "Foobar123123",
        hash: "$2b$12$lZt8mIupfvpzSmQeCSDVwOqfehvBf8m0eCl2mJuQI7SeckcURwBIy"
    },
    {
        username: "brita",
        name: "Brita Kottarainen",
        password: "Brita<3Brian",
        hash: "$2b$12$d3/UD.ifheqraiYqGt0U/e5oMenTreauxTxaf38PlByZWZGKaGlRi"
    }
];

const addUsers = async (knex: Knex, users: NewUser[]): Promise<void> => {
    await Promise.all(users.map(async (user) => {
        delete user.password;
        await knex(userTable).insert(user);
    }));
};

export async function seed(knex: Knex): Promise<void> {
    dotenv.config();

    // Delete existing users
    await knex(userTable).del();

    await addUsers(knex, userEntries);
}
