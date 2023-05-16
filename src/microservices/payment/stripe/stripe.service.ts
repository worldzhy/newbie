import {Injectable} from '@nestjs/common';
const stripe = require('stripe')(
  'sk_test_51N1OfRI3hIthhL2mYOBnp4mZLLUv4zL51fdiwfOIYMt0Y5URgrxMrNtT3Hh2WEL7k5XT1aB5m97MPqYTQb7129Hc009YCINgSm'
);
const YOUR_DOMAIN = 'http://localhost:4242';

@Injectable()
export class StripeService {
  /**
   * A PaymentIntent tracks the customer’s payment lifecycle,
   * keeping track of any failed payment attempts and ensuring the customer is only charged once.
   * Return the PaymentIntent’s client secret in the response to finish the payment on the client.
   */
  async createPaymentIntent(orderAmount: number): Promise<{clientSecret: any}> {
    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: orderAmount,
      currency: 'usd',
      // automatic_payment_methods: {enabled: true},
    });

    return {
      clientSecret: paymentIntent.client_secret,
    };
  }

  /**
   * A Checkout Session controls what your customer sees on the payment page such as
   * line items, the order amount and currency, and acceptable payment methods.
   * We enable cards and other common payment methods for you by default,
   * and you can enable or disable payment methods directly in the Stripe Dashboard.
   */
  async createCheckoutSession() {
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
          price: '{{PRICE_ID}}',
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${YOUR_DOMAIN}/success.html`,
      cancel_url: `${YOUR_DOMAIN}/cancel.html`,
    });

    return session;
    // res.redirect(303, session.url);
  }

  /* End */
}
