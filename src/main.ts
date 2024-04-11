import {INestApplication, ValidationPipe} from '@nestjs/common';
import {NestFactory} from '@nestjs/core';
import {ConfigService} from '@nestjs/config';
import {FastifyAdapter, NestFastifyApplication} from '@nestjs/platform-fastify';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import {
  DocumentBuilder,
  SwaggerModule,
  SwaggerCustomOptions,
} from '@nestjs/swagger';
import {ApplicationAircruiserModule as ApplicationModule} from './application-aircruiser/application-aircruiser.module';
// import {ApplicationBasketModule as ApplicationModule} from './application-basket/application-basket.module';
// import {ApplicationEnginedModule as ApplicationModule} from './application-engined/application-engined.module';
// import {ApplicationRecruitmentModule as ApplicationModule} from './application-recruitment/application-recruitment.module';
// import {ApplicationSolidcoreModule as ApplicationModule} from './application-solidcore/application-solidcore.module';

const nodeCluster = require('node:cluster');
const numCPUs = require('node:os').availableParallelism();

async function bootstrap() {
  // [step 1] Create a nestjs application.
  let app: INestApplication;
  if (process.env.NODE_FRAMEWORK === 'fastify') {
    app = await NestFactory.create<NestFastifyApplication>(
      ApplicationModule,
      new FastifyAdapter()
    );
  } else {
    app = await NestFactory.create(ApplicationModule);
    app.use(cookieParser());
  }

  // [step 2] Check required environment variables.
  const configService = app.get<ConfigService>(ConfigService);
  ['ENVIRONMENT', 'PORT', 'ALLOWED_ORIGINS', 'DATABASE_URL'].forEach(envVar => {
    if (!configService.getOrThrow<string>(envVar)) {
      throw Error(`Undefined environment variable: ${envVar}`);
    }
  });

  // [step 3] Enable features.
  app.enableCors({
    credentials: true,
    origin: configService.getOrThrow<string[]>('server.allowedOrigins'),
  });

  app.useGlobalPipes(
    new ValidationPipe({
      /**
       * By default, every path parameter and query parameter comes over the network as a string.
       * When we enable this behavior globally, the ValidationPipe will try to automatically convert a string identifier
       * to a number if we specified the id type as a number (in the method signature).
       */
      transform: true,
      /**
       * If set to true, validator will strip validated (returned) object of any properties that do not use any validation decorators.
       */
      whitelist: true,
    })
  );

  const env = configService.getOrThrow<string>('server.environment');
  const nodeFramework = configService.getOrThrow<string>(
    'server.nodeFramework'
  );
  if (env === 'production') {
    // helmet is only available in production environment.
    if (nodeFramework === 'express') {
      app.use(helmet());
    }
  } else if (env === 'development') {
    // API document is only available in development environment.
    const config = new DocumentBuilder()
      .setTitle('API Document')
      .setDescription("It's good to see you guys 🥤")
      .setVersion('1.0')
      .addCookieAuth('refreshToken')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    const customOptions: SwaggerCustomOptions = {
      explorer: true,
      swaggerOptions: {
        persistAuthorization: true,
        tagsSorter: 'alpha',
      },
      customSiteTitle: 'API Document',
    };
    SwaggerModule.setup('api', app, document, customOptions);
  }

  // [step 4] Listen port
  const port = configService.getOrThrow<number>('server.port');
  const server = await app.listen(port, '0.0.0.0');
  server.timeout = configService.getOrThrow<number>('server.httpTimeout');

  console.log(`Application is running on: ${await app.getUrl()}`);
}

function clusterize(callback: Function): void {
  if (nodeCluster.isPrimary) {
    console.log(`MASTER SERVER IS RUNNING`);

    for (let i = 0; i < numCPUs; i++) {
      nodeCluster.fork();
    }

    nodeCluster.on('online', (worker: {id: any}, code: any, signal: any) => {
      console.log(`WORKER SERVER ${worker.id} IS ONLINE`);
    });

    nodeCluster.on('exit', (worker: {id: any}, code: any, signal: any) => {
      console.log(`WORKER SERVER ${worker.id} EXITED`);
      nodeCluster.fork();
    });
  } else {
    callback();
  }
}

// * Start single node.
bootstrap();

// * Start node cluster.
// clusterize(bootstrap);
