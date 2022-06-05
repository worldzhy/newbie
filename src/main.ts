import {NestFactory} from '@nestjs/core';
import {
  SwaggerModule,
  DocumentBuilder,
  SwaggerCustomOptions,
} from '@nestjs/swagger';
import {AppModule} from './app.module';
import {CommonConfig} from './_config/_common.config';
import {Enum} from './_config/_common.enum';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // API document is only available in development environment.
  if (CommonConfig.getEnvironment() === Enum.environment.DEVELOPMENT) {
    const config = new DocumentBuilder()
      .setTitle('Cloud Native InceptionPad Basic')
      .setDescription('The API description')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    const customOptions: SwaggerCustomOptions = {
      swaggerOptions: {
        persistAuthorization: true,
        tagsSorter: 'alpha',
      },
      customSiteTitle: 'InceptionPad API Docs',
    };
    SwaggerModule.setup('api', app, document, customOptions);
  }

  // Listen port
  const port = process.env.PORT || 3000;
  await app.listen(port);
}
bootstrap();
