import { Request, Response } from "express";
import contactService from "../services/contact.service";

export const identifyContact = async (req: Request, res: Response) => {
  const { email, phoneNumber } = req.body;

  if (!email && !phoneNumber) {
    return res.status(400).json({ error: "Email or phone number required" });
  }

  try {
    const result = await contactService.identifyContact(email, phoneNumber);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};
