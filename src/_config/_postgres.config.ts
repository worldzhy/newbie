import {Injectable} from '@nestjs/common';

@Injectable()
export class PostgresConfig {
  static getHost = () => {
    if (typeof process.env.POSTGRES_HOST === 'string') {
      return process.env.POSTGRES_HOST;
    } else {
      return 'environment variable POSTGRES_HOST is invalid.';
    }
  };

  static getSchema = () => {
    if (typeof process.env.POSTGRES_SCHEMA === 'string') {
      return process.env.POSTGRES_SCHEMA;
    } else {
      return 'environment variable POSTGRES_SCHEMA is invalid.';
    }
  };

  static getUsername = () => {
    if (typeof process.env.POSTGRES_USERNAME === 'string') {
      return process.env.POSTGRES_USERNAME;
    } else {
      return 'environment variable POSTGRES_USERNAME is invalid.';
    }
  };

  static getPassword = () => {
    if (typeof process.env.POSTGRES_PASSWORD === 'string') {
      return process.env.POSTGRES_PASSWORD;
    } else {
      return 'environment variable POSTGRES_PASSWORD is invalid.';
    }
  };
}
