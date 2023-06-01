import {Prisma} from '@prisma/client';
import {CustomLoggerService} from '../../microservices/logger/logger.service';

export async function queryEventHandler(e: Prisma.QueryEvent) {
  const logger = new CustomLoggerService('Prisma');

  logger.log('👇👇👇');
  logger.log(`time: ${e.timestamp}`);
  logger.log(`query: ${e.query}`);
  logger.log(`params: ${e.params}`);
  logger.log(`duration: ${e.duration} ms`);
  logger.log(`target: ${e.target}`);
  logger.log('');
}

export async function infoEventHandler(e: Prisma.LogEvent) {
  const logger = new CustomLoggerService('Prisma');

  const message = `${e.timestamp} >> ${e.message} >> [Target] ${e.target}`;
  logger.log(message);
}

export async function warnEventHandler(e: Prisma.LogEvent) {
  const logger = new CustomLoggerService('Prisma');

  const message = `${e.timestamp} >> ${e.message} >> [Target] ${e.target}`;
  logger.warn(message);
}

export async function errorEventHandler(e: Prisma.LogEvent) {
  const logger = new CustomLoggerService('Prisma');

  const message = `${e.timestamp} >> ${e.message} >> [Target] ${e.target}`;
  logger.error(message);
}
