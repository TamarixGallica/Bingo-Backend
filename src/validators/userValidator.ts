import { Joi, schema } from "express-validation";

export const registerUserValidator: schema = {
    body: Joi.object({
        username: Joi.string().min(1).max(255).token().required(),
        name: Joi.string().min(1).max(255).required(),
        password: Joi.string().min(8).required(),
    })
};
