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
import {ApplicationModule} from './application/application.module';
// import {ApplicationExampleModule as ApplicationModule} from './application-example/application-example.module';

function checkEnvVars(configService: ConfigService) {
  const requiredEnvVars = ['ENVIRONMENT', 'PORT'];

  requiredEnvVars.forEach(envVar => {
    if (!configService.getOrThrow<string>(envVar)) {
      throw Error(`Undefined environment variable: ${envVar}`);
    }
  });
}

async function bootstrap() {
  // Create a nestjs application.
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

  // Check environment variables.
  const configService = app.get<ConfigService>(ConfigService);
  checkEnvVars(configService);

  // Get environment variables.
  const port = configService.getOrThrow<number>('application.port');
  const env = configService.getOrThrow<string>('application.environment');
  const nodeFramework = configService.getOrThrow<string>(
    'application.nodeFramework'
  );

  // Enable functions according to different env.
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
      swaggerOptions: {
        persistAuthorization: true,
        tagsSorter: 'alpha',
      },
      customSiteTitle: 'API Document',
    };
    SwaggerModule.setup('api', app, document, customOptions);
  }

  // Enable CORS
  app.enableCors();

  /**
   * By default, every path parameter and query parameter comes over the network as a string.
   * When we enable this behavior globally, the ValidationPipe will try to automatically convert a string identifier
   * to a number if we specified the id type as a number (in the method signature).
   */
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    })
  );

  // Listen port
  await app.listen(port, '0.0.0.0');

  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
