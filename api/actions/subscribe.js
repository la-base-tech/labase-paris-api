const dotenv = require('dotenv');

dotenv.config();

const cors = require('../_utils/cors');
const { addContactToList } = require('../_utils/sendInBlue');

module.exports = cors(async (event, res) => {
  try {
    const data = event.body;
    await addContactToList(data.email);
    res.status(200).json({ message: 'ok' });
  } catch (err) {
    res.status(500).send(err.toString());
  }
});
