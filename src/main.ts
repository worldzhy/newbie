import {NestFactory} from '@nestjs/core';
import {
  DocumentBuilder,
  SwaggerModule,
  SwaggerCustomOptions,
} from '@nestjs/swagger';
import {AppModule} from './app.module';
import {getServerConfig} from './_config/_server.config';

async function bootstrap() {
  // Create a nestjs application.
  const app = await NestFactory.create(AppModule);
  const serverConfig = getServerConfig();

  // API document is only available in development environment.
  if (serverConfig.environment === 'development') {
    const config = new DocumentBuilder()
      .setTitle("I'm a newbie")
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

  // Listen port
  const port = serverConfig.port;
  await app.listen(port);
}
bootstrap();
