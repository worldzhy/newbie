import {Module, MiddlewareConsumer} from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';
import ServerConfiguration from '../config';

// Toolkit and microservice modules
import {HttpMiddleware} from '@toolkit/nestjs/middleware/http.middleware';
import {MicroserviceModule} from '@microservices/microservice.module';

@Module({
  imports: [
    ConfigModule.forRoot({load: [ServerConfiguration]}),
    MicroserviceModule,
  ],
})
export class Application0Module {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HttpMiddleware).forRoutes('*');
  }
}
