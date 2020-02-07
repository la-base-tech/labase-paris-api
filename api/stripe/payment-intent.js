const dotenv = require('dotenv');

dotenv.config();

const stripe = require('./_utils/stripe');

module.exports = async function handler(event) {
  try {
    const data = JSON.parse(event.body);

    const { paymentIntentId, params } = data;

    let paymentIntent;

    const metadata = {
      firstname: params.firstname,
      lastname: params.lastname,
      email: params.email,
      subscribe: params.subscribe,
    };

    const paymentIntentParams = {
      currency: 'eur',
      payment_method_types: ['card'],
      metadata,
    };
    if (params.amount) {
      paymentIntentParams.amount = params.amount * 100;
      paymentIntentParams.description = `Don de ${params.amount}€`;
    }
    if (params.email) {
      paymentIntentParams.receipt_email = params.email;
    }

    if (paymentIntentId) {
      paymentIntent = await stripe.paymentIntents.update(
        paymentIntentId,
        paymentIntentParams
      );
    } else {
      paymentIntent = await stripe.paymentIntents.create(paymentIntentParams);
    }

    const response = {
      paymentIntent: {
        id: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
      },
    };

    return {
      statusCode: 200,
      body: JSON.stringify(response),
    };
  } catch (err) {
    return { statusCode: 500, body: err.toString() };
  }
};
