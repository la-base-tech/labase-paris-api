const Stripe = require('stripe');

const { STRIPE_SECRET_KEY } = process.env;

const config = {
  apiVersion: '2019-12-03',
};

const stripe = new Stripe(STRIPE_SECRET_KEY, config);

module.exports = stripe;
