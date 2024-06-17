const { Joi } = require("express-validation");

export const validateIdentifyDTO = {
  body: Joi.object({
    email: Joi.string().email().optional().messages({
      "string.base": `"email" should be a type of 'text'`,
      "string.email": `"email" should be a valid email address`,
      "string.empty": `"email" cannot be an empty field`,
    }),
    phoneNumber: Joi.string()
      .pattern(/^[0-9]+$/)
      .max(12)
      .optional(),
  }),
};
