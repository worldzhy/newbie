import {Injectable} from '@nestjs/common';

@Injectable()
export class ElasticsearchConfig {
  static getNode = () => {
    if (typeof process.env.ELASTICSEARCH_NODE === 'string') {
      return process.env.ELASTICSEARCH_NODE;
    } else {
      return 'environment variable ELASTICSEARCH_HOST is invalid.';
    }
  };

  static getUsername = () => {
    if (typeof process.env.ELASTICSEARCH_USERNAME === 'string') {
      return process.env.ELASTICSEARCH_USERNAME;
    } else {
      return 'environment variable ELASTICSEARCH_USERNAME is invalid.';
    }
  };

  static getPassword = () => {
    if (typeof process.env.ELASTICSEARCH_PASSWORD === 'string') {
      return process.env.ELASTICSEARCH_PASSWORD;
    } else {
      return 'environment variable ELASTICSEARCH_PASSWORD is invalid.';
    }
  };
}
