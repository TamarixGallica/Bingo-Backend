import { Joi, schema } from "express-validation";
import { id, idValidation, text } from "./shared";

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

export const themeUpdateValidator: schema = {
    params: Joi.object({
        id: id.required()
    }),
    body: Joi.object({
        id: id
            .valid(Joi.ref("$params.id", { adjust: (id) => parseInt(id) }))
            .required(),
        name: text.required()
    })
};

export const themeIdValidator = Object.assign({}, idValidation);
