"use strict";

import knex from "knex";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const knexConfig = require("../knexfile");

const environment = process.env.NODE_ENV || "development";

export default knex(knexConfig[environment]);
