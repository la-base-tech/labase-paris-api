const cors = require('micro-cors');

module.exports = handler => {
  return cors()(handler);
};
