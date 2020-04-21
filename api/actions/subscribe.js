const dotenv = require('dotenv');

dotenv.config();

const cors = require('../_utils/cors');
const {
  updateOrCreateContact,
  addContactToList,
} = require('../_utils/sendInBlue');

module.exports = cors(async (event, res) => {
  try {
    const data = event.body;
    const contact = await updateOrCreateContact(data.email);
    if (!contact) {
      throw new Error('Contact not found');
    }
    await addContactToList(contact, process.env.SENDINBLUE_LIST_ID_NEWSLETTER);
    res.status(200).json({ message: 'ok' });
  } catch (err) {
    res.status(500).send(err.toString());
  }
});
