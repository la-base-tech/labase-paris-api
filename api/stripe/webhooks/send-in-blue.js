const dotenv = require('dotenv');

dotenv.config();

const cors = require('../../_utils/cors');
const sendInBlue = require('../../_utils/sendInBlue');
const validateStripeRequest = require('./_utils/validateRequest');

const {
  APP_ENV,
  STRIPE_WEBHOOK_SEND_IN_BLUE_SIGNING_SECRET: STRIPE_WEBHOOK_SIGNING_SECRET,
  SENDINBLUE_LIST_ID_NEWSLETTER,
  SENDINBLUE_LIST_ID_CROWDFUNDING,
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

  const { metadata } = data;

  if (!(metadata && metadata.email)) {
    res.status(200).send('ok');
    return;
  }

  // Update or create the contact
  const contact = await sendInBlue.updateOrCreateContact(metadata.email, {
    PRENOM: metadata.firstname,
    NOM: metadata.lastname,
    DON_CF_2020: data.amount / 100,
    NEWSLETTER: !!(metadata && metadata.subscribe),
  });

  // Add the contact the new newsletter list
  if (metadata && metadata.subscribe) {
    await sendInBlue.addContactToList(contact, SENDINBLUE_LIST_ID_NEWSLETTER);
  }

  // Add the contact to the donateur list
  await sendInBlue.addContactToList(contact, SENDINBLUE_LIST_ID_CROWDFUNDING);

  res.status(200).send('ok');
});
