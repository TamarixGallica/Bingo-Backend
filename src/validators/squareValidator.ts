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
        .max(255)
        .required()
    })
};

export const squareIdValidator = Object.assign({}, idValidation);
