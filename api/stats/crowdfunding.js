const dotenv = require('dotenv');

dotenv.config();

const { getStats } = require('../_utils/stats');
const cors = require('../_utils/cors');

const { APP_ENV } = process.env;

module.exports = cors(async (req, res) => {
  const stats = await getStats(APP_ENV);
  res.status(200).json(stats);
});
