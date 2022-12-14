import {INestApplication} from '@nestjs/common';
import {NestFactory} from '@nestjs/core';
import {FastifyAdapter, NestFastifyApplication} from '@nestjs/platform-fastify';
import {
  DocumentBuilder,
  SwaggerModule,
  SwaggerCustomOptions,
} from '@nestjs/swagger';
import {ApplicationModule} from './applications/application.module';
import {getServerConfig} from './config';

async function bootstrap() {
  // Create a nestjs application.
  const serverConfig = getServerConfig();
  let app: INestApplication;
  if (serverConfig.node_framework === 'fastify') {
    app = await NestFactory.create<NestFastifyApplication>(
      ApplicationModule,
      new FastifyAdapter()
    );
  } else {
    app = await NestFactory.create(ApplicationModule);
  }

  // API document is only available in development environment.
  if (serverConfig.environment === 'development') {
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
  const port = serverConfig.port;
  await app.listen(port, '0.0.0.0');
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
