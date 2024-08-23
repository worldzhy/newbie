import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import {APP_GUARD, APP_INTERCEPTOR} from '@nestjs/core';
import {ScheduleModule} from '@nestjs/schedule';
import {AuditLogger} from './interceptors/audit-log.interceptor';
import {RateLimitInterceptor} from './interceptors/rate-limit.interceptor';
import {ApiLoggerMiddleware} from './middlewares/api-logger.middleware';
import {JsonBodyMiddleware} from './middlewares/json-body.middleware';
import {RawBodyMiddleware} from './middlewares/raw-body.middleware';
import {ApiKeysModule} from './modules/api-keys/api-keys.module';
import {ApprovedSubnetsModule} from './modules/approved-subnets/approved-subnets.module';
import {AuditLogsModule} from './modules/audit-logs/audit-logs.module';
import {AuthModule} from './modules/auth/auth.module';
import {ScopesGuard} from './modules/auth/scope.guard';
import {SaaSStarterAuthGuard} from './modules/auth/auth.guard';
import {DomainsModule} from './modules/domains/domains.module';
import {EmailsModule} from './modules/emails/emails.module';
import {GroupsModule} from './modules/groups/groups.module';
import {MembershipsModule} from './modules/memberships/memberships.module';
import {MultiFactorAuthenticationModule} from './modules/multi-factor-authentication/multi-factor-authentication.module';
import {SessionsModule} from './modules/sessions/sessions.module';
import {StripeModule} from './modules/stripe/stripe.module';
import {UsersModule} from './modules/users/users.module';
import {WebhooksModule} from './modules/webhooks/webhooks.module';
import {DnsModule} from './providers/dns/dns.module';
import {ElasticsearchModule} from './providers/elasticsearch/elasticsearch.module';
import {GeolocationModule} from './providers/geolocation/geolocation.module';
import {GoogleMapsModule} from './providers/google-maps/google-maps.module';
import {MailModule} from './providers/mail/mail.module';
import {S3Module} from './providers/s3/s3.module';
import {TasksModule} from './providers/tasks/tasks.module';
import {MetricsModule} from './modules/metrics/metrics.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TasksModule,
    UsersModule,
    AuthModule,
    MailModule,
    SessionsModule,
    EmailsModule,
    GroupsModule,
    MultiFactorAuthenticationModule,
    ApiKeysModule,
    ApprovedSubnetsModule,
    DomainsModule,
    DnsModule,
    GeolocationModule,
    MembershipsModule,
    StripeModule,
    AuditLogsModule,
    WebhooksModule,
    ElasticsearchModule,
    S3Module,
    GoogleMapsModule,
    MetricsModule,
  ],
  providers: [
    {provide: APP_INTERCEPTOR, useClass: RateLimitInterceptor},
    {provide: APP_GUARD, useClass: SaaSStarterAuthGuard},
    {provide: APP_GUARD, useClass: ScopesGuard},
    {provide: APP_INTERCEPTOR, useClass: AuditLogger},
  ],
})
export class SaaSStarterModule implements NestModule {
  public configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(RawBodyMiddleware)
      .forRoutes({
        path: '/webhooks/stripe',
        method: RequestMethod.POST,
      })
      .apply(JsonBodyMiddleware)
      .forRoutes('*')
      .apply(ApiLoggerMiddleware)
      .forRoutes('*');
  }
}
