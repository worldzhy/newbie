import {Injectable, OnModuleDestroy, OnModuleInit} from '@nestjs/common';
import {ExtendedPrismaClient} from './prisma.extension';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  /**
   * These methods are placeholders for NestJS lifecycle hooks.
   * The actual implementation is bound in the PrismaModule factory.
   */
  async onModuleInit(): Promise<void> {}
  async onModuleDestroy(): Promise<void> {}
}

/**
 * Declaration Merging:
 * This ensures the PrismaService class is treated as an ExtendedPrismaClient by TypeScript.
 */
export interface PrismaService extends ExtendedPrismaClient {}
