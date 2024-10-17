import {ValidationPipe} from '@nestjs/common';
import {NestFactory} from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import {urlencoded, json} from 'express';
import helmet from 'helmet';
import {
  DocumentBuilder,
  SwaggerModule,
  SwaggerCustomOptions,
} from '@nestjs/swagger';
import {ApplicationModule} from './application/application.module';
const nodeCluster = require('node:cluster');
const numCPUs = require('node:os').availableParallelism();

const enum Environment {
  Development = 'development',
  Production = 'production',
}
const environment = process.env.ENVIRONMENT ?? Environment.Development;
const port = parseInt(process.env.PORT ?? '') || 3000;
const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? '').split(',');
const timeoutOfHttpRequest = 60000; // milliseconds

async function bootstrap() {
  // [step 1] Create a nestjs application.
  const app = await NestFactory.create(ApplicationModule);
  app.use(cookieParser());

  // bodyParser was added back to express in release 4.16.0
  // https://stackoverflow.com/questions/47232187/express-json-vs-bodyparser-json
  app.use(json({limit: '10mb'})); // set max body size
  app.use(urlencoded({limit: '10mb', extended: true}));

  // [step 2] Enable features.
  app.enableCors({credentials: true, origin: allowedOrigins});

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

  if (environment === Environment.Production) {
    // helmet is only available in production environment.
    app.use(helmet());
  } else if (environment === Environment.Development) {
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

  // [step 3] Listen port
  const server = await app.listen(port, '0.0.0.0');
  server.timeout = timeoutOfHttpRequest;

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
