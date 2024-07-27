import {Injectable} from '@nestjs/common';
import {Cron} from '@nestjs/schedule';
import {CurrencyService} from '../gate/currency.service';
import {PrismaService} from '@toolkit/prisma/prisma.service';

@Injectable()
export class CronJobProducer {
  constructor(
    private readonly prisma: PrismaService,
    private readonly currencyService: CurrencyService
  ) {}

  @Cron('0 0 23 * * *')
  async fetchNewCurrencyPairs() {
    console.log('Fetch new currency pairs at ' + Date());

    // [step 1] Fetch currency pairs from remote.
    await this.currencyService.getAllCurrencyPairs();

    // [step 2] Get new currency pairs from database.
    const newCurrencyPairs = await this.currencyService.getNewCurrencyPairs();

    // [step 3] Create trade tasks for new currency pairs.
    for (let i = 0; i < newCurrencyPairs.length; i++) {
      const newCurrencyPair = newCurrencyPairs[i];

      const count = await this.prisma.tradeTask.count({
        where: {base: newCurrencyPair.base, quote: newCurrencyPair.quote},
      });
      if (count < 1) {
        await this.prisma.tradeTask.create({
          data: {
            base: newCurrencyPair.base,
            quote: newCurrencyPair.quote,
            quoteAmount: parseFloat(newCurrencyPair.minQuoteAmount ?? '1.0'), // Buy 1.0 if there is no min quote amount.
            buyStart: newCurrencyPair.buyStart,
          },
        });

        await this.prisma.cronTask.create({
          data: {
            name: '',
            cronTime: '',
          },
        });
      }
    }
  }
}
