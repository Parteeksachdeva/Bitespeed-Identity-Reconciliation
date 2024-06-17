import { QueryRunner, Repository } from "typeorm";
import { AppDataSource } from "../data-source";
import { Contact } from "../entity/Contact";

interface ContactResponse {
  contact: {
    primaryContactId: number;
    emails: string[];
    phoneNumbers: number[];
    secondaryContactIds: number[];
  };
}

class ContactService {
  private contactRepository: Repository<Contact>;
  constructor() {
    this.contactRepository = AppDataSource.getRepository(Contact);
  }

  /**
   * Identifies and consolidates contact information based on the given email or phone number.
   * This includes creating new primary contacts, linking secondary contacts, and ensuring
   * unique consolidated data for emails and phone numbers.
   *
   * @param {string | null} email - The email address to identify the contact by (optional).
   * @param {number | null} phoneNumber - The phone number to identify the contact by (optional).
   * @returns {Promise<ContactResponse>} - The consolidated contact information.
   * @throws {Error} - Throws an error if the contact identification process fails.
   */
  public async identifyContact(
    email: string | null = null,
    phoneNumber: number | null = null
  ): Promise<ContactResponse> {
    try {
      // Find all contacts with the given email or phone number, ordered by createdAt ascending
      const existingContacts = await this.contactRepository.find({
        select: ["id", "email", "phoneNumber", "linkPrecedence", "linkedId"],
        where: [{ email: email }, { phoneNumber: phoneNumber }],
        order: { createdAt: "ASC" },
      });

      // No existing contacts, create a new primary contact
      if (!existingContacts.length) {
        const newContact = this.contactRepository.create({
          email,
          phoneNumber,
          linkPrecedence: "primary",
        });
        const contact = await this.contactRepository.save(newContact);

        return {
          contact: {
            primaryContactId: Number(contact.id),
            emails: [email],
            phoneNumbers: [Number(phoneNumber)].filter(Boolean),
            secondaryContactIds: [],
          },
        };
      }

      // Separate primary and secondary contacts
      let primaryContact = existingContacts.filter(
        (c) => c.linkPrecedence === "primary"
      );
      let secondaryContact = existingContacts.filter(
        (c) => c.linkPrecedence === "secondary"
      );

      // Handle case where there are no primary contacts but there are secondary contacts
      if (primaryContact.length === 0 && secondaryContact.length > 0) {
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

      // Handle case for multiple primary contacts
      if (primaryContact.length > 1) {
        let query = "";
        for (let index = 1; index < primaryContact.length; index++) {
          const contact = primaryContact[index];
          contact["linkPrecedence"] = "secondary";
          contact["linkedId"] = primaryContact[0].id;

          query += `
            UPDATE contact
            SET "linkedId" = ${primaryContact[0].id}, "linkPrecedence" = 'secondary'
            WHERE id = ${contact.id};
            
            UPDATE contact
            SET "linkedId" = ${primaryContact[0].id}
            WHERE "linkedId" = ${contact.id};
            `;

          secondaryContact.push({ ...contact });
        }

        // Perform bulk update to change the linkedId of all contacts that were converted from primary to secondary
        // This ensures that the linkedId of both the converted primary contacts and their associated secondary contacts
        // are updated to point to the new primary contact
        await this.contactRepository.query(query);

        primaryContact = [primaryContact[0]];
      }

      // Create a new secondary contact if the combination is new
      if (
        !existingContacts.some(
          (c) =>
            c.email === email && Number(c.phoneNumber) === Number(phoneNumber)
        )
      ) {
        const newContact = this.contactRepository.create({
          email,
          phoneNumber,
          linkPrecedence: "secondary",
          linkedId: primaryContact[0].id,
        });
        const contact = await this.contactRepository.save(newContact);

        secondaryContact.push(contact);
      }

      // Consolidate unique emails and phone numbers
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
          primaryContactId: Number(primaryContact[0].id),
          emails,
          phoneNumbers,
          secondaryContactIds: secondaryContact.map((e) => e.id),
        },
      };
    } catch (error) {
      console.error(error);
    }
  }
}

export default new ContactService();
