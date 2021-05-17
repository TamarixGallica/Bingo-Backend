import { Joi, schema } from "express-validation";
import { idValidation, text } from "./shared";

export const themeQueryValidator: schema = {
    query: Joi.object({
        name: Joi.string()
            .optional()
    })
};

export const themeAddValidator: schema = {
    body: Joi.object({
        name: text.required()
    })
};


export const themeIdValidator = Object.assign({}, idValidation);
