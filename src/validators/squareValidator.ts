import { Joi, schema } from "express-validation";
import { id, idValidation } from "./shared";

export const text = Joi.string().max(255);

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
    body: Joi.object({
        id: id.required(),
        text,
        themeId
    }).or("text", "themeId")
};

export const squareIdValidator = Object.assign({}, idValidation);
