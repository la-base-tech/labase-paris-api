const dotenv = require('dotenv');

dotenv.config();

const stripe = require('./_utils/stripe');

module.exports = async (event, res) => {
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

    res.status(200).json(response);
  } catch (err) {
    res.status(500).send(err.toString());
  }
};
