import {Processor, Process, OnQueueCompleted} from '@nestjs/bull';
import {Job} from 'bull';
import {QueueName} from '@microservices/queue/queue.service';
import {AvailabilityExpressionService} from '@microservices/event-scheduling/availability-expression.service';
import {AvailabilityTimeslotService} from '@microservices/event-scheduling/availability-timeslot.service';
import {AvailabilityExpressionStatus} from '@prisma/client';

@Processor(QueueName.DEFAULT)
export class AvailabilityTaskConsumer {
  constructor(
    private availabilityExpressionService: AvailabilityExpressionService,
    private availabilityTimeslotService: AvailabilityTimeslotService
  ) {}

  @Process()
  async parseAvailability(job: Job) {
    console.log(job.data);

    let availabilityExpressionId = (job.data as any)
      .availabilityExpressionId as number;

    // [step 1] Parse expression to timeslots.
    const availabilityTimeslots =
      await this.availabilityExpressionService.parse(availabilityExpressionId);

    if (availabilityTimeslots.length === 0) {
      return {};
    }

    // [step 2] Delete and create timeslots.
    await this.availabilityTimeslotService.deleteMany({
      where: {expressionId: availabilityExpressionId},
    });
    await this.availabilityTimeslotService.createMany({
      data: availabilityTimeslots,
    });

    // [step 3] Update expression status.
    await this.availabilityExpressionService.update({
      where: {id: availabilityExpressionId},
      data: {
        status: AvailabilityExpressionStatus.PUBLISHED,
      },
    });

    return {};
  }

  @OnQueueCompleted()
  onCompleted(job: Job, result: any) {
    console.log('completed.');
  }
}
