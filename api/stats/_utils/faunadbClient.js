const faunadb = require('faunadb');

const { FAUNADB_KEY_SECRET } = process.env;

const client = new faunadb.Client({
  secret: FAUNADB_KEY_SECRET,
});

module.exports = client;
