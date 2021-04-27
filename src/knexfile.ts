"use strict";

import dotenv from "dotenv";
dotenv.config();

module.exports = {
  development: {
    client: "postgresql",
    connection: process.env.DATABASE_URL,
    migrations: {
      tableName: "knex_migrations",
      directory: `${ __dirname }/../db/migrations`
    },
    seeds: {
      directory: `${ __dirname }/../db/seeds`
    }
  },

  test: {
    client: "postgresql",
    connection: process.env.TEST_DATABASE_URL,
    migrations: {
      tableName: "knex_migrations",
      directory: `${ __dirname }/../db/migrations`
    },
    seeds: {
      directory: `${ __dirname }/../db/seeds`
    }
  },

  staging: {
    client: "postgresql",
    connection: process.env.DATABASE_URL,
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: "knex_migrations"
    }
  },

  production: {
    client: "postgresql",
    connection: process.env.DATABASE_URL,
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: "knex_migrations"
    }
  }
};
