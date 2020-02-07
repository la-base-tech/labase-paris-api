const cors = require('../_utils/cors');

module.exports = cors((req, res) => {
  res.send('hello world');
});
