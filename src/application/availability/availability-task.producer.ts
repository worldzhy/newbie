import {forms_v1} from '@googleapis/forms';
import {UserProfileService} from '@microservices/account/user/user-profile.service';
import {UserService} from '@microservices/account/user/user.service';
import {AvailabilityExpressionService} from '@microservices/event-scheduling/availability-expression.service';
import {EventVenueService} from '@microservices/event-scheduling/event-venue.service';
import {GoogleFormService} from '@microservices/google-form/google-form.service';
import {QueueService} from '@microservices/queue/queue.service';
import {Injectable} from '@nestjs/common';
import {Cron} from '@nestjs/schedule';
import {User} from '@prisma/client';
import {
  currentQuarter,
  firstDayOfMonth,
  lastDayOfMonth,
} from '@toolkit/utilities/datetime.util';

const HOUR_OF_DAY_START = 5;
const HOUR_OF_DAY_END = 22;
const COACH_AVAILABILITY_DURATION_GOOGLE_FORM = 15;

// const FORM_ID = '1ZmhzTfL3ZtQ0eLS2NCAGjkc97GDUAnFxet6oEa_RYSc';
const FORM_ID = '1xB_y800-DRU5EtAI_AAHrQHdlfstRpikVJy6rYlBnMk';

enum FormItemTitle {
  Timestamp = 'Timestamp',
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
export class AvailabilityTaskProducer {
  constructor(
    private readonly googleFormService: GoogleFormService,
    private readonly userService: UserService,
    private readonly userProfileService: UserProfileService,
    private readonly availabilityExpressionService: AvailabilityExpressionService,
    private readonly eventVenueService: EventVenueService,
    private readonly queueService: QueueService
  ) {}

  @Cron('0 0 1 1 *')
  async handleCron() {
    let year = new Date().getFullYear();
    let quarter = currentQuarter();
    if (quarter === 4) {
      year += 1;
      quarter = 1;
    } else {
      quarter += 1;
    }

    // [step 1] Process quarter.
    let stringMonths = '1';
    let dateOfOpening = new Date();
    let dateOfClosure = new Date();
    switch (quarter) {
      case 1:
        stringMonths = '1-3';
        dateOfOpening = firstDayOfMonth(year, 1);
        dateOfClosure = lastDayOfMonth(year, 3);
      case 2:
        stringMonths = '4-6';
        dateOfOpening = firstDayOfMonth(year, 4);
        dateOfClosure = lastDayOfMonth(year, 6);
      case 3:
        stringMonths = '7-9';
        dateOfOpening = firstDayOfMonth(year, 7);
        dateOfClosure = lastDayOfMonth(year, 9);
      case 4:
        stringMonths = '10-12';
        dateOfOpening = firstDayOfMonth(year, 10);
        dateOfClosure = lastDayOfMonth(year, 12);
    }

    // [step 2] Parse google form.
    let timestampQuestionId: string = '';
    let emailItemQuestionId: string = '';
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
      if (title?.startsWith(FormItemTitle.Timestamp)) {
        if (
          formItem.questionItem &&
          formItem.questionItem.question &&
          formItem.questionItem.question.questionId
        ) {
          timestampQuestionId = formItem.questionItem.question.questionId;
        }
      }
      //
      if (title?.startsWith(FormItemTitle.Email)) {
        if (
          formItem.questionItem &&
          formItem.questionItem.question &&
          formItem.questionItem.question.questionId
        ) {
          emailItemQuestionId = formItem.questionItem.question.questionId;
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
    // const sortedFormResponses = formResponses.sort((a, b) => {
    //   if (
    //     a.answers &&
    //     a.answers[timestampQuestionId] &&
    //     b.answers &&
    //     b.answers[timestampQuestionId]
    //   ) {
    //     const answerOfA = a.answers[timestampQuestionId];
    //     const answerOfB = b.answers[timestampQuestionId];

    //     if (
    //       answerOfA.textAnswers &&
    //       answerOfA.textAnswers.answers &&
    //       answerOfA.textAnswers.answers[0].value &&
    //       answerOfB.textAnswers &&
    //       answerOfB.textAnswers.answers &&
    //       answerOfB.textAnswers.answers[0].value
    //     ) {
    //       const dateOfA = new Date(answerOfA.textAnswers.answers[0].value);
    //       const dateOfB = new Date(answerOfB.textAnswers.answers[0].value);
    //       if (dateOfA > dateOfB) {
    //         return -1;
    //       } else if (dateOfA < dateOfB) {
    //         return 1;
    //       } else {
    //         return 0;
    //       }
    //     }
    //   }
    //   return 0;
    // });

    for (let i = 0; i < formResponses.length; i++) {
      const formResponse = formResponses[i];
      const answers = formResponse.answers;
      if (!answers) {
        console.log('Answers is empty' + i);
        continue;
      }

      // [step 3-1] Get the coach.
      let coach: User | null = null;
      if (answers[emailItemQuestionId]) {
        const answer = answers[emailItemQuestionId];
        if (
          answer.textAnswers &&
          answer.textAnswers.answers &&
          answer.textAnswers.answers[0].value
        ) {
          coach = await this.userService.findUnique({
            where: {
              email: answer.textAnswers.answers[0].value.trim().toLowerCase(),
            },
            select: {
              id: true,
              email: true,
              profile: {select: {fullName: true}},
            },
          });
        }
      } else {
        console.log('Answer is not found: ' + i);
        console.log(formResponse.answers);
      }
      if (!coach) {
        console.log('Coach is not found: ' + i);
        console.log(answers[emailItemQuestionId].textAnswers?.answers);
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

      const resultOfDelete =
        await this.availabilityExpressionService.deleteMany({
          where: {
            name: {contains: year + ' Q' + quarter, mode: 'insensitive'},
            hostUserId: coach.id,
          },
        });
      if (resultOfDelete.count > 0) {
        console.log(
          'Duplicated response: ' + coach.email + ' | id: ' + coach.id
        );
      }

      const exp = await this.availabilityExpressionService.create({
        data: {
          name: coach['profile'].fullName + ' - ' + year + ' Q' + quarter,
          hostUserId: coach.id,
          venueIds: coachLocationIds,
          cronExpressionsOfAvailableTimePoints: cronExpressions,
          dateOfOpening,
          dateOfClosure,
          minutesOfDuration: COACH_AVAILABILITY_DURATION_GOOGLE_FORM,
        },
      });

      // [step 3-7] Add it to task queue.
      await this.queueService.addJob({availabilityExpressionId: exp.id});
    }
  }
}
