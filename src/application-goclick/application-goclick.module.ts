import {Module, MiddlewareConsumer} from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';
import ApplicationConfiguration from '../config';

// Toolkit and microservice modules
import {HttpMiddleware} from '@toolkit/nestjs/middleware/http.middleware';
import {MicroserviceModule} from '@microservices/microservice.module';

// Application0 controllers
import {AppGoClickModule} from './go-click/go-click.module';

@Module({
  imports: [
    ConfigModule.forRoot({load: [ApplicationConfiguration]}),
    // Microservices (Global modules)
    MicroserviceModule,
    AppGoClickModule,
  ],
})
export class ApplicationGoClickModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HttpMiddleware).forRoutes('*');
  }
}
