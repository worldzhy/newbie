/* eslint-disable node/no-unpublished-import */
import {Test, TestingModule} from '@nestjs/testing';
import {INestApplication} from '@nestjs/common';
import * as request from 'supertest';
import {ApplicationModule} from '@application/application.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ApplicationModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });
});
