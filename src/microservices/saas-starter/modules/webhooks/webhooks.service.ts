import {
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import type {Prisma} from '@prisma/client';
import {Webhook} from '@prisma/client';
import pQueue from 'p-queue';
import pRetry from 'p-retry';
import axios from 'axios';
import {
  UNAUTHORIZED_RESOURCE,
  WEBHOOK_NOT_FOUND,
} from '../../errors/errors.constants';
import {Expose} from '../../helpers/interfaces';
import {expose} from '../../helpers/expose';
import {PrismaService} from '@framework/prisma/prisma.service';

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);
  private queue = new pQueue({concurrency: 1});

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService
  ) {}

  async createWebhook(
    groupId: number,
    data: Omit<Omit<Prisma.WebhookCreateInput, 'webhook'>, 'group'>
  ): Promise<Webhook> {
    return this.prisma.webhook.create({
      data: {...data, group: {connect: {id: groupId}}},
    });
  }

  async getWebhooks(
    groupId: number,
    params: {
      skip?: number;
      take?: number;
      cursor?: Prisma.WebhookWhereUniqueInput;
      where?: Prisma.WebhookWhereInput;
      orderBy?: Prisma.WebhookOrderByWithAggregationInput;
    }
  ): Promise<Expose<Webhook>[]> {
    const {skip, take, cursor, where, orderBy} = params;
    try {
      const webhooks = await this.prisma.webhook.findMany({
        skip,
        take,
        cursor,
        where: {...where, group: {id: groupId}},
        orderBy,
      });
      return webhooks.map(group => expose<Webhook>(group));
    } catch (error) {
      return [];
    }
  }

  async getWebhook(groupId: number, id: number): Promise<Expose<Webhook>> {
    const webhook = await this.prisma.webhook.findUnique({
      where: {id},
    });
    if (!webhook) throw new NotFoundException(WEBHOOK_NOT_FOUND);
    if (webhook.groupId !== groupId)
      throw new UnauthorizedException(UNAUTHORIZED_RESOURCE);
    return expose<Webhook>(webhook);
  }

  async updateWebhook(
    groupId: number,
    id: number,
    data: Prisma.WebhookUpdateInput
  ): Promise<Expose<Webhook>> {
    const testWebhook = await this.prisma.webhook.findUnique({
      where: {id},
    });
    if (!testWebhook) throw new NotFoundException(WEBHOOK_NOT_FOUND);
    if (testWebhook.groupId !== groupId)
      throw new UnauthorizedException(UNAUTHORIZED_RESOURCE);
    const webhook = await this.prisma.webhook.update({
      where: {id},
      data,
    });
    return expose<Webhook>(webhook);
  }

  async replaceWebhook(
    groupId: number,
    id: number,
    data: Prisma.WebhookCreateInput
  ): Promise<Expose<Webhook>> {
    const testWebhook = await this.prisma.webhook.findUnique({
      where: {id},
    });
    if (!testWebhook) throw new NotFoundException(WEBHOOK_NOT_FOUND);
    if (testWebhook.groupId !== groupId)
      throw new UnauthorizedException(UNAUTHORIZED_RESOURCE);
    const webhook = await this.prisma.webhook.update({
      where: {id},
      data,
    });
    return expose<Webhook>(webhook);
  }

  async deleteWebhook(groupId: number, id: number): Promise<Expose<Webhook>> {
    const testWebhook = await this.prisma.webhook.findUnique({
      where: {id},
    });
    if (!testWebhook) throw new NotFoundException(WEBHOOK_NOT_FOUND);
    if (testWebhook.groupId !== groupId)
      throw new UnauthorizedException(UNAUTHORIZED_RESOURCE);
    const webhook = await this.prisma.webhook.delete({
      where: {id},
    });
    return expose<Webhook>(webhook);
  }

  async getWebhookScopes(): Promise<Record<string, string>> {
    const scopes: Record<string, string> = {
      'create-api-key': 'Create API key',
      'update-api-key': 'Update API key',
      'delete-api-key': 'Delete API key',
      'create-domain': 'Create domain',
      'delete-domain': 'Delete domain',
      'verify-domain-txt': 'Verify domain (TXT)',
      'verify-domain-html': 'Verify domain (HTML)',
      'update-info': 'Update info',
      delete: 'Delete group',
      'add-membership': 'Add membership',
      'update-membership': 'Update membership',
      'delete-membership': 'Delete membership',
      'create-billing': 'Create billing',
      'update-billing': 'Update billing',
      'delete-billing': 'Delete billing',
      'write-source': 'Write source',
      'delete-source': 'Delete source',
      'create-subscription': 'Create subscription',
      'delete-subscription': 'Delete subscription',
      'create-webhook': 'Create webhook',
      'update-webhook': 'Update webhook',
      'delete-webhook': 'Delete webhook',
    };
    return scopes;
  }

  triggerWebhook(groupId: number, event: string) {
    this.prisma.webhook
      .findMany({
        where: {group: {id: groupId}, isActive: true, event},
      })
      .then(webhooks => {
        webhooks.forEach(webhook =>
          this.queue
            .add(() =>
              pRetry(() => this.callWebhook(webhook, event), {
                retries:
                  this.configService.get<number>(
                    'microservices.saas-starter.webhooks.retries'
                  ) ?? 3,
                onFailedAttempt: error => {
                  this.logger.error(
                    `Triggering webhoook failed, retrying (${error.retriesLeft} attempts left)`,
                    error.name
                  );
                  if (error.retriesLeft === 0)
                    this.prisma.webhook
                      .update({
                        where: {id: webhook.id},
                        data: {isActive: false},
                      })
                      .then(() => {})
                      .catch(() => {});
                },
              })
            )
            .then(() => {})
            .catch(() => {})
        );
      })
      .catch(error => this.logger.error('Unable to get webhooks', error));
  }

  private async callWebhook(webhook: Webhook, event: string) {
    if (webhook.contentType === 'application/json')
      await axios.post(webhook.url, {event});
    else await axios.post(webhook.url, event);
    await this.prisma.webhook.update({
      where: {id: webhook.id},
      data: {lastFiredAt: new Date()},
    });
  }
}
