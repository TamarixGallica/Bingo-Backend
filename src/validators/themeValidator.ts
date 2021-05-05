import { Joi, schema } from "express-validation";
import { idValidation } from "./shared";

export const themeQueryValidator: schema = {
    query: Joi.object({
        name: Joi.string()
            .optional()
    })
};

export const themeIdValidator = Object.assign({}, idValidation);
