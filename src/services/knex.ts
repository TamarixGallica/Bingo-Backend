"use strict"

import knex from "knex";
const knexConfig = require("../knexfile");

const environment = process.env.NODE_ENV || "development";

export default knex(knexConfig[environment]);
