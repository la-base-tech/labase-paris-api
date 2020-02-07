const cors = require('micro-cors');

module.exports = handler => {
  return cors()((req, res) => {
    const isPreFlight = req.method === 'OPTIONS';
    if (isPreFlight) {
      res.status(200).send('ok');
      return;
    }
    handler(req, res);
  });
};
