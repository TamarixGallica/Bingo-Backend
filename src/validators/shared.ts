import { Joi, schema } from "express-validation";

export const idValidation: schema = {
    params: Joi.object({
        id: Joi.number()
            .integer()
            .positive()
            .required()
    })
};
