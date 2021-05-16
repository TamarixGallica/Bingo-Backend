import { Joi, schema } from "express-validation";

export const id = Joi.number().integer().positive();

export const idValidation: schema = {
    params: Joi.object({
        id: id.required()
    })
};
