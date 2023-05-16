import {Controller, Get} from '@nestjs/common';
import {ApiTags} from '@nestjs/swagger';
import {Public} from '../../../applications/account/authentication/public/public.decorator';
import {StripeService} from '../../../microservices/payment/stripe/stripe.service';

@ApiTags('[Application] Tc Request / Payment')
@Public()
@Controller('tc-payment')
export class TcPaymentController {
  private stripeService = new StripeService();

  @Get('client-secret')
  async getWorkflowTrails(): Promise<{clientSecret: any}> {
    return await this.stripeService.createPaymentIntent(50); // $0.5 usd
  }

  /* End */
}
