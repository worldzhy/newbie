import {Logger as TypeOrmLogger, QueryRunner} from 'typeorm';
import {CustomLoggerService} from './logger.service';

/**
 * This logger is prepared for typeorm developers.
 *
 * How to use?
 * [1] Config TypeOrmModule:
 *     - logger: new CustomTypeOrmLogger(),
 *     - logging: true,
 * [2] Logs produced by typeorm will be collected automatically.
 *
 * @export
 * @class CustomTypeOrmLogger
 * @implements {TypeOrmLogger}
 */
export class CustomTypeOrmLogger implements TypeOrmLogger {
  private loggerContext = 'TypeOrm';

  constructor(private readonly logger: CustomLoggerService) {}

  logQuery(query: string, parameters?: unknown[], queryRunner?: QueryRunner) {
    if (queryRunner?.data?.isCreatingLogs) {
      return;
    }
    this.logger.log(
      `${query} -- Parameters: ${JSON.stringify(parameters)}`,
      this.loggerContext
    );
  }

  logQueryError(
    error: string,
    query: string,
    parameters?: unknown[],
    queryRunner?: QueryRunner
  ) {
    if (queryRunner?.data?.isCreatingLogs) {
      return;
    }
    this.logger.error(
      `${query} -- Parameters: ${JSON.stringify(parameters)} -- ${error}`,
      this.loggerContext
    );
  }

  logQuerySlow(
    time: number,
    query: string,
    parameters?: unknown[],
    queryRunner?: QueryRunner
  ) {
    if (queryRunner?.data?.isCreatingLogs) {
      return;
    }
    this.logger.warn(
      `Time: ${time} -- Parameters: ${JSON.stringify(parameters)} -- ${query}`,
      this.loggerContext
    );
  }

  logMigration(message: string) {
    this.logger.log(message, this.loggerContext);
  }

  logSchemaBuild(message: string) {
    this.logger.log(message, this.loggerContext);
  }

  log(
    level: 'log' | 'info' | 'warn',
    message: string,
    queryRunner?: QueryRunner
  ) {
    if (queryRunner?.data?.isCreatingLogs) {
      return;
    }
    if (level === 'log') {
      return this.logger.log(message, this.loggerContext);
    }
    if (level === 'info') {
      return this.logger.debug(message, this.loggerContext);
    }
    if (level === 'warn') {
      return this.logger.warn(message, this.loggerContext);
    }
  }
}
