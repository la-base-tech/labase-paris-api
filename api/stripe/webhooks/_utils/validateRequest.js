const stripe = require('../../_utils/stripe');

function getRawBody(req) {
  return new Promise(resolve => {
    const rawBody = [];
    req.on('data', chunk => {
      rawBody.push(chunk);
    });
    req.on('end', () => {
      resolve(Buffer.concat(rawBody));
    });
  });
}

async function validateStripeRequest(req) {
  const stripeSignature = req.headers['stripe-signature'];

  if (!stripeSignature) {
    throw new Error('Missing Stripe signature');
  }

  const rawBody = await getRawBody(req);

  return stripe.webhooks.constructEvent(
    rawBody,
    stripeSignature,
    process.env.STRIPE_WEBHOOK_SIGNING_SECRET
  );
}

module.exports = validateStripeRequest;
