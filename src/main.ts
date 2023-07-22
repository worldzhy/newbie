import {INestApplication} from '@nestjs/common';
import {NestFactory} from '@nestjs/core';
import {ConfigService} from '@nestjs/config';
import {FastifyAdapter, NestFastifyApplication} from '@nestjs/platform-fastify';
import {
  DocumentBuilder,
  SwaggerModule,
  SwaggerCustomOptions,
} from '@nestjs/swagger';
import {ApplicationModule} from './application/application.module';

function checkEnvironment(configService: ConfigService) {
  const requiredEnvVars = ['ENVIRONMENT', 'PORT'];

  requiredEnvVars.forEach(envVar => {
    if (!configService.get<string>(envVar)) {
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
  }

  // Check environment variables.
  const configService = app.get<ConfigService>(ConfigService);
  checkEnvironment(configService);

  // API document is only available in development environment.
  if (configService.get<string>('application.environment') === 'development') {
    const config = new DocumentBuilder()
      .setTitle("Here's the Newbie")
      .setDescription("It's good to see you guys 🥤")
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    const customOptions: SwaggerCustomOptions = {
      swaggerOptions: {
        persistAuthorization: true,
        tagsSorter: 'alpha',
      },
      customSiteTitle: 'Newbie APIs',
    };
    SwaggerModule.setup('api', app, document, customOptions);
  }

  // Enable CORS
  app.enableCors();

  // Listen port
  const port = configService.get<number>('project.port') || 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
