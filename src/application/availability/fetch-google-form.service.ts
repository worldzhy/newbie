import {forms_v1} from '@googleapis/forms';
import {UserProfileService} from '@microservices/account/user/user-profile.service';
import {UserService} from '@microservices/account/user/user.service';
import {AvailabilityExpressionService} from '@microservices/event-scheduling/availability-expression.service';
import {EventVenueService} from '@microservices/event-scheduling/event-venue.service';
import {GoogleFormService} from '@microservices/google-form/google-form.service';
import {QueueTaskService} from '@microservices/queue/queue-task.service';
import {Injectable} from '@nestjs/common';
import {Cron, CronExpression} from '@nestjs/schedule';
import {User} from '@prisma/client';
import {
  firstDayOfMonth,
  lastDayOfMonth,
} from '@toolkit/utilities/datetime.util';

const HOUR_OF_DAY_START = 5;
const HOUR_OF_DAY_END = 22;
const COACH_AVAILABILITY_DURATION_GOOGLE_FORM = 15;
enum QUARTER {
  Q1 = 'Q1',
  Q2 = 'Q2',
  Q3 = 'Q3',
  Q4 = 'Q4',
}

const FORM_ID = '1ZmhzTfL3ZtQ0eLS2NCAGjkc97GDUAnFxet6oEa_RYSc';
enum FormItemTitle {
  Email = 'Email',
  HomeLocation = 'Select your home studio',
  AdditionalLocations = 'Select additional studios',
  MinimumPreferredQuota = 'Select minimum # of preferred classes',
  MaximumPreferredQuota = 'Select maximum # of preferred classes',
  WeekdayAvailability = 'Select your weekday availability',
  PreferredWeekdayAvailability = 'Select your preferred weekday availability',
  WeekendAvailability = 'Select your weekend day of availability',
  PreferredWeekendAvailability = 'Select your preferred weekend times',
}

@Injectable()
export class FetchGoogleFormService {
  constructor(
    private readonly googleFormService: GoogleFormService,
    private readonly userService: UserService,
    private readonly userProfileService: UserProfileService,
    private readonly availabilityExpressionService: AvailabilityExpressionService,
    private readonly eventVenueService: EventVenueService,
    private readonly queueTaskService: QueueTaskService
  ) {}

  @Cron(CronExpression.EVERY_12_HOURS)
  async handleCron() {
    const body = {year: '2023', quarter: 'Q4'};
    console.log('Cingo');
    console.log('Cingo');
    console.log('Cingo');
    // [step 1] Process quarter.
    const year = parseInt(body.year);
    let stringMonths = '1';
    let dateOfOpening = new Date();
    let dateOfClosure = new Date();
    switch (body.quarter) {
      case QUARTER.Q1:
        stringMonths = '1-3';
        dateOfOpening = firstDayOfMonth(year, 1);
        dateOfClosure = lastDayOfMonth(year, 3);
      case QUARTER.Q2:
        stringMonths = '4-6';
        dateOfOpening = firstDayOfMonth(year, 4);
        dateOfClosure = lastDayOfMonth(year, 6);
      case QUARTER.Q3:
        stringMonths = '7-9';
        dateOfOpening = firstDayOfMonth(year, 7);
        dateOfClosure = lastDayOfMonth(year, 9);
      case QUARTER.Q4:
        stringMonths = '10-12';
        dateOfOpening = firstDayOfMonth(year, 10);
        dateOfClosure = lastDayOfMonth(year, 12);
    }

    // [step 2] Parse google form.
    const mappingQuestion_TextInputItem: Record<string, forms_v1.Schema$Item> =
      {};
    const locationItemQuestionIds: string[] = [];
    const mappingQuestion_NumberItem: Record<string, forms_v1.Schema$Item> = {};
    const mappingQuestion_WeekdayTimeslot: Record<string, string> = {};
    const mappingQuestion_PreferredWeekdayTimeslot: Record<string, string> = {};
    const mappingQuestion_AvailableWeekendsItem: Record<
      string,
      forms_v1.Schema$Item
    > = {};
    const mappingQuestion_PreferredWeekendTimesItem: Record<
      string,
      forms_v1.Schema$Item
    > = {};

    const formItems = await this.googleFormService.getFormItems(FORM_ID);
    for (let i = 0; i < formItems.length; i++) {
      const formItem = formItems[i];
      const title = formItem.title;
      //
      if (title?.startsWith(FormItemTitle.Email)) {
        if (
          formItem.questionItem &&
          formItem.questionItem.question &&
          formItem.questionItem.question.questionId
        ) {
          mappingQuestion_TextInputItem[
            formItem.questionItem.question.questionId
          ] = formItem;
        }
      }
      //
      if (
        title?.startsWith(FormItemTitle.HomeLocation) ||
        title?.startsWith(FormItemTitle.AdditionalLocations)
      ) {
        if (
          formItem.questionItem &&
          formItem.questionItem.question &&
          formItem.questionItem.question.questionId
        ) {
          locationItemQuestionIds.push(
            formItem.questionItem.question.questionId
          );
        }
      }
      //
      if (
        title?.startsWith(FormItemTitle.MinimumPreferredQuota) ||
        title?.startsWith(FormItemTitle.MaximumPreferredQuota)
      ) {
        if (
          formItem.questionItem &&
          formItem.questionItem.question &&
          formItem.questionItem.question.questionId
        ) {
          mappingQuestion_NumberItem[
            formItem.questionItem.question.questionId
          ] = formItem;
        }
      }
      //
      if (title?.startsWith(FormItemTitle.WeekdayAvailability)) {
        if (
          formItem.questionGroupItem &&
          formItem.questionGroupItem.questions
        ) {
          formItem.questionGroupItem.questions.forEach(question => {
            if (
              question.questionId &&
              question.rowQuestion &&
              question.rowQuestion.title
            ) {
              mappingQuestion_WeekdayTimeslot[question.questionId] =
                question.rowQuestion.title;
            }
          });
        }
      }
      //
      if (title?.startsWith(FormItemTitle.PreferredWeekdayAvailability)) {
        if (
          formItem.questionGroupItem &&
          formItem.questionGroupItem.questions
        ) {
          formItem.questionGroupItem.questions.forEach(question => {
            if (
              question.questionId &&
              question.rowQuestion &&
              question.rowQuestion.title
            ) {
              mappingQuestion_PreferredWeekdayTimeslot[question.questionId] =
                question.rowQuestion.title;
            }
          });
        }
      }
      //
      if (title?.startsWith(FormItemTitle.WeekendAvailability)) {
        if (
          formItem.questionItem &&
          formItem.questionItem.question &&
          formItem.questionItem.question.questionId
        ) {
          mappingQuestion_AvailableWeekendsItem[
            formItem.questionItem.question.questionId
          ] = formItem;
        }
      }
      //
      if (title?.startsWith(FormItemTitle.PreferredWeekendAvailability)) {
        if (
          formItem.questionItem &&
          formItem.questionItem.question &&
          formItem.questionItem.question.questionId
        ) {
          mappingQuestion_PreferredWeekendTimesItem[
            formItem.questionItem.question.questionId
          ] = formItem;
        }
      }
    }

    // [step 3] Process google form responses.
    const formResponses = await this.googleFormService.getFormResponses(
      FORM_ID
    );

    for (let i = 0; i < formResponses.length; i++) {
      const formResponse = formResponses[i];
      const answers = formResponse.answers;
      if (!answers) {
        continue;
      }

      // [step 3-1] Get the coach.
      let coach: User | null = null;
      for (let questionId in mappingQuestion_TextInputItem) {
        if (
          mappingQuestion_TextInputItem[questionId].title ===
          FormItemTitle.Email
        ) {
          // The answer questionId is the same with the keys of the answers.
          const answer = answers[questionId];
          if (
            answer.textAnswers &&
            answer.textAnswers.answers &&
            answer.textAnswers.answers[0].value
          ) {
            coach = await this.userService.findUnique({
              where: {
                email: answer.textAnswers.answers[0].value.trim().toLowerCase(),
              },
              select: {id: true, profile: {select: {fullName: true}}},
            });
            break;
          }
        }
      }
      if (!coach) {
        continue;
      }

      // [step 3-2] Get coach's quota.
      for (let questionId in mappingQuestion_NumberItem) {
        const answer = answers[questionId];
        if (
          answer.textAnswers &&
          answer.textAnswers.answers &&
          answer.textAnswers.answers[0].value
        ) {
          if (
            mappingQuestion_NumberItem[questionId].title ===
            FormItemTitle.MinimumPreferredQuota
          ) {
            await this.userProfileService.update({
              where: {userId: coach.id},
              data: {
                quotaOfWeekMinPreference: parseInt(
                  answer.textAnswers.answers[0].value
                ),
              },
            });
          } else if (
            mappingQuestion_NumberItem[questionId].title ===
            FormItemTitle.MaximumPreferredQuota
          ) {
            await this.userProfileService.update({
              where: {userId: coach.id},
              data: {
                quotaOfWeekMaxPreference: parseInt(
                  answer.textAnswers.answers[0].value
                ),
              },
            });
          }
        }
      }

      // [step 3-3] Get coach's weekday availability timeslots.
      const cronExpressions: string[] = [];
      for (let questionId in mappingQuestion_WeekdayTimeslot) {
        // Make sure this timeslot is available.
        if (!answers[questionId]) {
          continue;
        }

        const timeslot = mappingQuestion_WeekdayTimeslot[questionId];
        let hour: number = 0;
        let minute: number = 0;
        if (timeslot.endsWith('am')) {
          const time = timeslot.replace('am', '');
          const hourAndMinute = time.split(':');
          hour = parseInt(hourAndMinute[0]);
          minute = parseInt(hourAndMinute[1]);
        } else if (timeslot.endsWith('pm')) {
          const time = timeslot.replace('pm', '');
          const hourAndMinute = time.split(':');
          hour = parseInt(hourAndMinute[0]);
          if (hour !== 12) {
            hour += 12;
          }
          minute = parseInt(hourAndMinute[1]);
        }

        const answer = answers[questionId];
        if (answer.textAnswers && answer.textAnswers.answers) {
          const stringWeekdays = answer.textAnswers.answers
            .map(obj => {
              if (obj.value && obj.value.trim()) {
                switch (obj.value.trim()) {
                  case 'Monday':
                    return 1;
                  case 'Tuesday':
                    return 2;
                  case 'Wednesday':
                    return 3;
                  case 'Thursday':
                    return 4;
                  case 'Friday':
                    return 5;
                }
              }
            })
            .toString(); // Return '1,2,3,4,5'

          cronExpressions.push(
            `${minute} ${hour} * ${stringMonths} ${stringWeekdays}`
          );
        }
      }

      // [step 3-4] Get coach's weekend availability timeslots.
      for (let questionId in mappingQuestion_AvailableWeekendsItem) {
        const answer = answers[questionId];
        if (answer.textAnswers && answer.textAnswers.answers) {
          const minutes: number[] = [];
          for (
            let i = 0;
            i < 60 / COACH_AVAILABILITY_DURATION_GOOGLE_FORM;
            i++
          ) {
            minutes.push(i * COACH_AVAILABILITY_DURATION_GOOGLE_FORM);
          }
          const stringMinutes = minutes.toString();

          const stringWeekends = answer.textAnswers.answers
            .map(obj => {
              if (obj.value && obj.value.trim()) {
                switch (obj.value.trim()) {
                  case 'Saturday':
                    return 6;
                  case 'Sunday':
                    return 0;
                }
              }
            })
            .toString(); // Return '6,0'

          cronExpressions.push(
            `${stringMinutes} ${HOUR_OF_DAY_START}-${HOUR_OF_DAY_END} * ${stringMonths} ${stringWeekends}`
          );
        }
      }

      // [step 3-5] Get coach's locations.
      const coachLocationNames: string[] = [];
      locationItemQuestionIds.forEach(questionId => {
        if (answers[questionId]) {
          const answer = answers[questionId];
          if (answer.textAnswers && answer.textAnswers.answers) {
            answer.textAnswers.answers.forEach(obj => {
              if (obj.value && obj.value.trim()) {
                const location = obj.value
                  .replace(' -', ',')
                  .replace(' & ', '&')
                  .trim();
                if (!coachLocationNames.includes(location)) {
                  coachLocationNames.push(location);
                }
              }
            });
          }
        }
      });

      // [step 3-6] Create or overwrite coach availability expression.
      const venues = await this.eventVenueService.findMany({
        where: {name: {in: coachLocationNames}},
        select: {id: true},
      });
      const coachLocationIds = venues.map(venue => {
        return venue.id;
      });

      await this.availabilityExpressionService.deleteMany({
        where: {
          name: {contains: body.year + ' ' + body.quarter, mode: 'insensitive'},
          hostUserId: coach.id,
        },
      });

      const exp = await this.availabilityExpressionService.create({
        data: {
          name:
            coach['profile'].fullName + ' - ' + body.year + ' ' + body.quarter,
          hostUserId: coach.id,
          venueIds: coachLocationIds,
          cronExpressionsOfAvailableTimePoints: cronExpressions,
          dateOfOpening,
          dateOfClosure,
          minutesOfDuration: COACH_AVAILABILITY_DURATION_GOOGLE_FORM,
        },
      });
      console.log('Bingo');

      // [step 3-7] Add it to task queue.
      await this.queueTaskService.add2queue({
        data: {
          name: 'test',
          data: {availabilityExpressionId: exp.id},
        },
      });
      console.log('Yingo');
    }
  }
}
