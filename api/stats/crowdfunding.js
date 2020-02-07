const dotenv = require('dotenv');

dotenv.config();

const { getStats } = require('./_utils/stats');

const { APP_ENV } = process.env;

module.exports = async function handler() {
  const stats = await getStats(APP_ENV);

  return {
    statusCode: 200,
    body: JSON.stringify(stats),
  };
};
