import {Injectable} from '@nestjs/common';
import {PrismaService} from '@toolkit/prisma/prisma.service';
import {Prisma, StripePaymentIntent} from '@prisma/client';

const stripe = require('stripe')(
  'sk_test_51N1OfRI3hIthhL2mYOBnp4mZLLUv4zL51fdiwfOIYMt0Y5URgrxMrNtT3Hh2WEL7k5XT1aB5m97MPqYTQb7129Hc009YCINgSm'
);
const YOUR_DOMAIN = 'http://localhost:4242';

@Injectable()
export class StripePaymentIntentService {
  constructor(private readonly prisma: PrismaService) {}

  async findUnique(
    params: Prisma.StripePaymentIntentFindUniqueArgs
  ): Promise<StripePaymentIntent | null> {
    return await this.prisma.stripePaymentIntent.findUnique(params);
  }

  async findMany(
    params: Prisma.StripePaymentIntentFindManyArgs
  ): Promise<StripePaymentIntent[]> {
    return await this.prisma.stripePaymentIntent.findMany(params);
  }

  async create(
    params: Prisma.StripePaymentIntentCreateArgs
  ): Promise<StripePaymentIntent> {
    return await this.prisma.stripePaymentIntent.create(params);
  }

  async update(
    params: Prisma.StripePaymentIntentUpdateArgs
  ): Promise<StripePaymentIntent> {
    return await this.prisma.stripePaymentIntent.update(params);
  }

  async delete(
    params: Prisma.StripePaymentIntentDeleteArgs
  ): Promise<StripePaymentIntent> {
    return await this.prisma.stripePaymentIntent.delete(params);
  }

  async generate(params: {
    orderId: string;
    orderAmount: number;
  }): Promise<StripePaymentIntent> {
    // [step 1] Generate a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: params.orderAmount,
      currency: 'usd',
      // automatic_payment_methods: {enabled: true},
    });

    // [step 2] Record the payment intent in database.
    return await this.prisma.stripePaymentIntent.create({
      data: {
        id: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount,
        clientSecret: paymentIntent.client_secret,
        orderId: params.orderId,
      },
    });
  }

  async retrieve(paymentIntentId: string): Promise<StripePaymentIntent> {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    return await this.prisma.stripePaymentIntent.update({
      where: {id: paymentIntentId},
      data: {
        status: paymentIntent.status,
        amount: paymentIntent.amount,
        clientSecret: paymentIntent.client_secret,
      },
    });
  }

  /* End */
}
