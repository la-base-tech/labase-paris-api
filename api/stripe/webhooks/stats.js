const dotenv = require('dotenv');

dotenv.config();

const cors = require('../../_utils/cors');
const { getStats, updateStats } = require('../../_utils/stats');
const validateStripeRequest = require('./_utils/validateRequest');

const {
  APP_ENV,
  STRIPE_WEBHOOK_STATS_SIGNING_SECRET: STRIPE_WEBHOOK_SIGNING_SECRET,
} = process.env;

module.exports = cors(async (req, res) => {
  let event;

  try {
    event = await validateStripeRequest(req, STRIPE_WEBHOOK_SIGNING_SECRET);
  } catch (err) {
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  if (event.type !== 'payment_intent.succeeded') {
    res.status(400).send('Invalid event type');
    return;
  }

  // Skip tests in production
  if (!event.livemode && APP_ENV === 'production') {
    res.status(200).send('skipped (production test)');
    return;
  }

  const data = event.data.object;

  // Get current stats
  const currentStats = await getStats(APP_ENV);

  // Update stats
  await updateStats(APP_ENV, {
    contributors: currentStats.contributors + 1,
    amount: currentStats.amount + data.amount / 100,
  });

  res.status(200).send('ok');
});
