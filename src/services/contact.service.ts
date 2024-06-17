import { QueryRunner, Repository } from "typeorm";
import { AppDataSource } from "../data-source";
import { Contact } from "../entity/Contact";

class ContactService {
  private contactRepository: Repository<Contact>;
  constructor() {
    this.contactRepository = AppDataSource.getRepository(Contact);
  }

  public async identifyContact(email = null, phoneNumber = null) {
    try {
      //find all contacts with email or phone number order by createdAt ascending
      const existingContacts = await this.contactRepository.find({
        select: ["id", "email", "phoneNumber", "linkPrecedence", "linkedId"],
        where: [{ email: email }, { phoneNumber: phoneNumber }],
        order: { createdAt: "ASC" },
      });

      if (!existingContacts.length) {
        const newContact = this.contactRepository.create({
          email,
          phoneNumber,
          linkPrecedence: "primary",
        });
        const contact = await this.contactRepository.save(newContact);

        return {
          contact: {
            primaryContactId: contact.id,
            emails: [email],
            phoneNumbers: [phoneNumber],
            secondaryContactIds: [],
          },
        };
      }

      let primaryContact = existingContacts.filter(
        (c) => c.linkPrecedence === "primary"
      );

      let secondaryContact = existingContacts.filter(
        (c) => c.linkPrecedence === "secondary"
      );

      if (primaryContact.length === 0 && secondaryContact.length > 0) {
        // if no primary take linkedID from any one from array and then fetch primary
        console.log("No primary contact only sec");

        const primaryId = secondaryContact[0].linkedId;
        const primary = await this.contactRepository.find({
          select: ["id", "email", "phoneNumber", "linkPrecedence", "linkedId"],
          where: [{ id: primaryId }],
        });
        primaryContact = [...primary];
        secondaryContact = await this.contactRepository.find({
          select: ["id", "email", "phoneNumber", "linkPrecedence", "linkedId"],
          where: [{ linkedId: primaryId }],
        });
      }

      if (primaryContact.length > 1) {
        console.log("Multiple primary contact");

        // Multiple primary's convert 2nd or above to secondary contacts
        let query = "";
        for (let index = 1; index < primaryContact.length; index++) {
          const contact = primaryContact[index];
          contact["linkPrecedence"] = "secondary";
          contact["linkedId"] = primaryContact[0].id;

          query += `
            UPDATE contact
            SET "linkedId" = ${primaryContact[0].id}, "linkPrecedence" = 'secondary'
            WHERE id = ${contact.id};`;

          query += `
            UPDATE contact
            SET "linkedId" = ${primaryContact[0].id}
            WHERE "linkedId" = ${contact.id};`;

          secondaryContact.push({ ...contact });
        }

        // Need to change linkedId of contacts to new primary that we have converted (bulk update)
        console.log({ query });

        await this.contactRepository.query(query);

        primaryContact = [primaryContact[0]];
      }

      if (
        !existingContacts.some(
          (c) =>
            c.email === email && Number(c.phoneNumber) === Number(phoneNumber)
        )
      ) {
        console.log("Creating new secondary");
        const newContact = this.contactRepository.create({
          email,
          phoneNumber,
          linkPrecedence: "secondary",
          linkedId: primaryContact[0].id,
        });
        const contact = await this.contactRepository.save(newContact);

        secondaryContact.push(contact);
      }

      const emails = Array.from(
        new Set(
          [
            primaryContact[0].email,
            ...secondaryContact.map((e) => e.email),
          ].filter((e) => e)
        )
      );

      const phoneNumbers = Array.from(
        new Set(
          [
            Number(primaryContact[0].phoneNumber),
            ...secondaryContact.map((e) => Number(e.phoneNumber)),
          ].filter((e) => e)
        )
      );

      return {
        contact: {
          primaryContatctId: primaryContact[0].id,
          emails,
          phoneNumbers,
          secondaryContactIds: secondaryContact.map((e) => e.id),
          primaryContact,
          secondaryContact,
        },
      };
    } catch (error) {
      console.error(error);
    }
  }
}

export default new ContactService();
