import { Joi, schema } from "express-validation";

export const cardValidator: schema = {
    query: Joi.object({
        rows: Joi.number().integer().min(2).required(),
        columns: Joi.number().integer().min(2).required(),
    })
};
