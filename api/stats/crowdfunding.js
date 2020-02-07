const dotenv = require('dotenv');

dotenv.config();

const { getStats } = require('./_utils/stats');

const { APP_ENV } = process.env;

module.exports = async (req, res) => {
  const stats = await getStats(APP_ENV);
  res.status(200).json(stats);
};
