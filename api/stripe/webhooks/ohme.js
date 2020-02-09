const dotenv = require('dotenv');

dotenv.config();

const cors = require('../../_utils/cors');
const validateStripeRequest = require('./_utils/validateRequest');
const ohme = require('../../_utils/ohme');

const {
  APP_ENV,
  STRIPE_WEBHOOK_OHME_SIGNING_SECRET: STRIPE_WEBHOOK_SIGNING_SECRET,
  OHME_CLIENT_NAME,
  OHME_CLIENT_SECRET,
} = process.env;

const OHME_PAYMENT_SOURCE_NAME = 'Crowdfunding 2020 - Stripe';
const OHME_CUSTOM_FIELD_STRIPE_PAYMENT_ID = 'stripe_payment_id';

export async function createOhmePaymentFromStripe(stripeData, ohmeAuthParams) {
  const { metadata } = stripeData;

  // Stripe is using amount in cents, so 30€ = 3000 and Ohme is using 30€
  const ohmeAmount = stripeData.amount_received / 100;

  const date = new Date(stripeData.created * 1000);
  const ohmeDate = ohme.formatDate(date);

  const ohmePaymentParams = {
    date: ohmeDate,
    amount: ohmeAmount,
    payment_type_id: 1,
    payment_method_name: 'Carte de crédit',
    donation_nature: 'cash',
    donation_form: 'manual',
    donator_nature: 'individual',
    payment_source_name: OHME_PAYMENT_SOURCE_NAME,
    can_edit_receipt: true,
    contact: {
      email: metadata.email,
      firstname: metadata.firstname,
      lastname: metadata.lastname,
    },
  };

  const ohmePaymentCustomParams = {
    [OHME_CUSTOM_FIELD_STRIPE_PAYMENT_ID]: stripeData.id,
  };

  const result = await ohme.createPayment(
    ohmeAuthParams,
    ohmePaymentParams,
    ohmePaymentCustomParams
  );

  return {
    paymentId: result.data.id,
    contactId: result.data.contact_id,
  };
}

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

  const data = event.data.object;

  // Test in production
  if (!data.livemode && APP_ENV === 'production') {
    res.status(200).send('ok');
    return;
  }

  const ohmeAuthParams = {
    clientName: OHME_CLIENT_NAME,
    clientSecret: OHME_CLIENT_SECRET,
  };

  // Create Ohme payment and user
  const {
    paymentId: ohmePaymentId,
    contactId: ohmeContactId,
  } = await createOhmePaymentFromStripe(data, ohmeAuthParams);

  res.status(200).send({
    ohmePaymentId,
    ohmeContactId,
  });
});
