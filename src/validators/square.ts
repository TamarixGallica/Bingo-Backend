import { Joi, schema } from "express-validation";
import { idValidation } from "./shared";


export const squareQueryValidator: schema = {
    query: Joi.object({
        text: Joi.string()
            .optional()
    })
};

export const squareIdValidator = Object.assign({}, idValidation);
