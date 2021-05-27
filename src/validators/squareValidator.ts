import { Joi, schema } from "express-validation";
import { id, idValidation, text } from "./shared";

export const themeId = Joi.array().items(id);

export const squareQueryValidator: schema = {
    query: Joi.object({
        text: Joi.string()
            .optional()
    })
};

export const squareAddValidator: schema = {
    body: Joi.object({
        text: text.required(),
        themeId
    })
};

export const squareUpdateValidator: schema = {
    params: Joi.object({
        id: id.required()
    }),
    body: Joi.object({
        id: id
            .valid(Joi.ref("$params.id", { adjust: (id) => parseInt(id) }))
            .required(),
        text,
        themeId
    }).or("text", "themeId")
};

export const squareIdValidator = Object.assign({}, idValidation);
