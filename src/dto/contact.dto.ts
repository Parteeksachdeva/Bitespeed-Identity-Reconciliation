const { Joi } = require("express-validation");

export const validateIdentifyDTO = {
  body: Joi.object({
    email: Joi.string().optional(),
    phoneNumber: Joi.string().optional(),
  }),
};
