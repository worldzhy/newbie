import {Express} from 'express';
import {forms_v1} from '@googleapis/forms';
import {GoogleFormsService} from '@microservices/googleapis/google-forms.service';
import {BadRequestException, Injectable} from '@nestjs/common';
import {
  firstDayOfMonth,
  lastDayOfMonth,
} from '@toolkit/utilities/datetime.util';
import {XLSXService} from '@toolkit/xlsx/xlsx.service';
import {PrismaService} from '@toolkit/prisma/prisma.service';

const HOUR_OF_DAY_START = 5;
const HOUR_OF_DAY_END = 22;
const COACH_AVAILABILITY_DURATION_GOOGLE_FORM = 15;
const FORM_ID = '1xB_y800-DRU5EtAI_AAHrQHdlfstRpikVJy6rYlBnMk';

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
export class AvailabilityService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly googleFormsService: GoogleFormsService
  ) {}

  async parseXLSXFile(
    file: Express.Multer.File,
    params: {year: number; quarter: number}
  ) {
    // [step 1] Process quarter.
    const {stringMonths, dateOfOpening, dateOfClosure} =
      this.generateSpecificParams(params.year, params.quarter);

    // [step 2] Process excel data.
    const xlsx = new XLSXService();
    xlsx.loadFile(file);

    const sheets = xlsx.getSheets();
    const sheet = sheets[0];
    const rows = xlsx.getDataRows(sheet);
    for (let i = 0; i < rows.length; i++) {
      // [step 2-1] Get the coach.
      const row = rows[i];
      if (!row['Email'] || !row['Email'].trim() || !row['Timestamp']) {
        continue;
      }

      const coach = await this.prisma.user.findUnique({
        where: {email: row['Email'].trim().toLowerCase()},
        select: {id: true, profile: {select: {fullName: true}}},
      });
      if (!coach) {
        continue;
      }

      // [step 2-2] Only process the new response from a coach.
      const count = await this.prisma.availabilityExpression.count({
        where: {
          hostUserId: coach.id,
          reportedAt: {gte: new Date(row['Timestamp'])},
        },
      });
      if (count > 0) {
        continue;
      }

      // [step 2-3] Generate coach availability expression.
      const cronExpressions: string[] = [];
      const coachLocationNames: string[] = [];
      for (const key in row) {
        // 1) Process weekday availability
        let isTimeKey = false;
        let hour: number = 0;
        let minute: number = 0;
        if (key.endsWith('am]')) {
          isTimeKey = true;
          const time = key
            .replace('Select your weekday availability: [', '')
            .replace('am]', '');
          const hourAndMinute = time.split(':');
          hour = parseInt(hourAndMinute[0]);
          minute = parseInt(hourAndMinute[1]);
        } else if (key.endsWith('pm]')) {
          isTimeKey = true;
          const time = key
            .replace('Select your weekday availability: [', '')
            .replace('pm]', '');
          const hourAndMinute = time.split(':');
          hour = parseInt(hourAndMinute[0]);
          minute = parseInt(hourAndMinute[1]);
          if (hour !== 12) {
            hour += 12;
          }
        } else {
        }

        if (isTimeKey) {
          const weekdays = row[key].split(';');
          const stringWeekdays = weekdays
            .map((weekday: string) => {
              switch (weekday.trim()) {
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
            })
            .toString(); // Return '1,2,3,4,5'
          cronExpressions.push(
            `${minute} ${hour} * ${stringMonths} ${stringWeekdays}`
          );
        }

        // 2) Process weekend availability.
        const minutes: number[] = [];
        for (let i = 0; i < 60 / COACH_AVAILABILITY_DURATION_GOOGLE_FORM; i++) {
          minutes.push(i * COACH_AVAILABILITY_DURATION_GOOGLE_FORM);
        }
        const stringMinutes = minutes.toString();
        if (key.startsWith('Select your weekend day of availability')) {
          const weekends = row[key].split(';');
          const stringWeekends = weekends
            .map((weekend: string) => {
              switch (weekend.trim()) {
                case 'Saturday':
                  return 6;
                case 'Sunday':
                  return 0;
              }
            })
            .toString(); // Return '6,0'
          cronExpressions.push(
            `${stringMinutes} ${HOUR_OF_DAY_START}-${HOUR_OF_DAY_END} * ${stringMonths} ${stringWeekends}`
          );
        }

        // 3) Process coach locations.
        if (key.startsWith('Select your home studio')) {
          const location = row[key]
            .replace(' -', ',')
            .replace(' & ', '&')
            .trim();
          if (!coachLocationNames.includes(location)) {
            coachLocationNames.push(location);
          }
        }
        if (key.startsWith('Select additional studios')) {
          row[key].split(';').map((location: string) => {
            location = location.replace(' -', ',').replace(' & ', '&').trim();
            if (!coachLocationNames.includes(location)) {
              coachLocationNames.push(location);
            }
          });
        }
      }

      // [step 2-4] Create or overwrite coach availability expression.
      const venues = await this.prisma.eventVenue.findMany({
        where: {name: {in: coachLocationNames}},
        select: {id: true},
      });
      const coachLocationIds = venues.map(venue => {
        return venue.id;
      });

      await this.prisma.availabilityExpression.deleteMany({
        where: {
          name: {
            contains: params.year + ' Q' + params.quarter,
            mode: 'insensitive',
          },
          hostUserId: coach.id,
        },
      });

      await this.prisma.availabilityExpression.create({
        data: {
          name:
            coach['profile']!.fullName +
            ' - ' +
            params.year +
            ' Q' +
            params.quarter,
          hostUserId: coach.id,
          venueIds: coachLocationIds,
          cronExpressionsOfAvailableTimePoints: cronExpressions,
          dateOfOpening,
          dateOfClosure,
          minutesOfDuration: COACH_AVAILABILITY_DURATION_GOOGLE_FORM,
          reportedAt: new Date(row['Timestamp']),
        },
      });

      // [step 2-5] Update coach profile.
      await this.prisma.userProfile.update({
        where: {userId: coach.id},
        data: {
          eventVenueIds: coachLocationIds,
          quotaOfWeekMinPreference:
            row['Select minimum # of preferred classes:'],
          quotaOfWeekMaxPreference:
            row['Select maximum # of preferred classes:'],
        },
      });
    }
  }

  async fetchGoogleForm(params: {year: number; quarter: number}) {
    // [step 1] Process quarter.
    const {stringMonths, dateOfOpening, dateOfClosure} =
      this.generateSpecificParams(params.year, params.quarter);

    // [step 2] Parse google form.
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

    const formItems = await this.googleFormsService.getFormItems(FORM_ID);
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
    const formResponses =
      await this.googleFormsService.getFormResponses(FORM_ID);
    for (let i = 0; i < formResponses.length; i++) {
      const formResponse = formResponses[i];
      // ! The timestamp is required in a coach's response.
      let reportedAt: Date | null = null;
      if (formResponse.lastSubmittedTime) {
        reportedAt = new Date(formResponse.lastSubmittedTime);
      }
      if (!reportedAt) {
        continue;
      }

      const answers = formResponse.answers;
      if (!answers) {
        continue;
      }

      // [step 3-1] Get the coach.
      let coach: {
        id: string;
        email: string | null;
        profile: {fullName: string | null} | null;
      } | null = null;
      if (answers[emailItemQuestionId]) {
        const answer = answers[emailItemQuestionId];
        if (
          answer.textAnswers &&
          answer.textAnswers.answers &&
          answer.textAnswers.answers[0].value
        ) {
          coach = await this.prisma.user.findUnique({
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
        console.log(formResponse.answers);
      }
      if (!coach) {
        console.log(
          'Coach is not found: ' +
            answers[emailItemQuestionId].textAnswers?.answers![0].value
        );
        continue;
      }

      // Only process the new response from a coach.
      const count = await this.prisma.availabilityExpression.count({
        where: {hostUserId: coach.id, reportedAt: {gte: reportedAt}},
      });
      if (count > 0) {
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
            await this.prisma.userProfile.update({
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
            await this.prisma.userProfile.update({
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
      const venues = await this.prisma.eventVenue.findMany({
        where: {name: {in: coachLocationNames}},
        select: {id: true},
      });
      const coachLocationIds = venues.map(venue => {
        return venue.id;
      });

      const resultOfDelete =
        await this.prisma.availabilityExpression.deleteMany({
          where: {
            name: {
              contains: params.year + ' Q' + params.quarter,
              mode: 'insensitive',
            },
            hostUserId: coach.id,
          },
        });
      if (resultOfDelete.count > 0) {
        console.log(
          'Deleted old response: ' + coach.email + '( ' + coach.id + ' )'
        );
      }

      await this.prisma.availabilityExpression.create({
        data: {
          name:
            coach.profile?.fullName +
            ' - ' +
            params.year +
            ' Q' +
            params.quarter,
          hostUserId: coach.id,
          venueIds: coachLocationIds,
          cronExpressionsOfAvailableTimePoints: cronExpressions,
          dateOfOpening,
          dateOfClosure,
          minutesOfDuration: COACH_AVAILABILITY_DURATION_GOOGLE_FORM,
          reportedAt: reportedAt,
        },
      });
    }
  }

  private generateSpecificParams(year: number, quarter: number) {
    let stringMonths = '1';
    let dateOfOpening: Date;
    let dateOfClosure: Date;
    switch (quarter) {
      case 1:
        stringMonths = '1-3';
        dateOfOpening = firstDayOfMonth(year, 1);
        dateOfClosure = lastDayOfMonth(year, 3);
        break;
      case 2:
        stringMonths = '4-6';
        dateOfOpening = firstDayOfMonth(year, 4);
        dateOfClosure = lastDayOfMonth(year, 6);
        break;
      case 3:
        stringMonths = '7-9';
        dateOfOpening = firstDayOfMonth(year, 7);
        dateOfClosure = lastDayOfMonth(year, 9);
        break;
      case 4:
        stringMonths = '10-12';
        dateOfOpening = firstDayOfMonth(year, 10);
        dateOfClosure = lastDayOfMonth(year, 12);
        break;
      default:
        throw new BadRequestException('Bad parameter: quarter');
    }

    return {stringMonths, dateOfOpening, dateOfClosure};
  }
}
