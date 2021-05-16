import { Joi, schema } from "express-validation";
import { idValidation } from "./shared";


export const squareQueryValidator: schema = {
    query: Joi.object({
        text: Joi.string()
            .optional()
    })
};

export const squareUpdateValidator: schema = {
    body: Joi.object({
        id: Joi.number()
        .integer()
        .positive()
        .required(),
        text: Joi.string()
        .max(255),
        themeId: Joi.array()
        .items(Joi.number().integer().positive())
    }).or("text", "themeId")
};

export const squareIdValidator = Object.assign({}, idValidation);
