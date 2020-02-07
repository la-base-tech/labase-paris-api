const dotenv = require('dotenv');

dotenv.config();

const cors = require('../_utils/cors');
const { getStats, updateStats } = require('../_utils/stats');
const { addContactToList } = require('../_utils/sendInBlue');
const stripe = require('./_utils/stripe');

const { APP_ENV } = process.env;

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

module.exports = cors(async (req, res) => {
  let event;

  try {
    event = await validateStripeRequest(req);
  } catch (err) {
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  if (event.type !== 'payment_intent.succeeded') {
    res.status(400).send('Invalid event type');
    return;
  }

  const data = event.data.object;

  // Test in production
  if (!data.livemode && APP_ENV === 'production') {
    res.status(200).send('ok');
    return;
  }

  // Get current stats
  const currentStats = await getStats(APP_ENV);

  // Update stats
  await updateStats(APP_ENV, {
    contributors: currentStats.contributors + 1,
    amount: currentStats.amount + data.amount / 100,
  });

  const { metadata } = data;

  // Add the customer to the mailing list
  if (metadata && metadata.subscribe && metadata.email) {
    await addContactToList(metadata.email);
  }

  res.status(200).send('ok');
});
