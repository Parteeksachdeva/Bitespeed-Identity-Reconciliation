class ContactService {
  async identifyContact(email: string, phoneNumber: string) {
    console.log({ email, phoneNumber });
  }
}

export default new ContactService();
