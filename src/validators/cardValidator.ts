import { Joi, schema } from "express-validation";

export const cardValidator: schema = {
    query: Joi.object({
        rows: Joi.number().integer().min(2).required(),
        columns: Joi.number().integer().min(2).required(),
        themeId: Joi.alternatives().try(
            Joi.array().items(Joi.number().integer().positive()),
            Joi.number().integer().positive()
        )
    })
};
