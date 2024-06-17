import express from "express";
import { validate } from "express-validation";

import { identifyContact } from "../controllers/contact.controller";
import { validateIdentifyDTO } from "../dto/contact.dto";

const router = express.Router();

router.post(
  `/identify`,
  validate(validateIdentifyDTO, {}, {}),
  identifyContact
);

export { router as ContactRoute };
