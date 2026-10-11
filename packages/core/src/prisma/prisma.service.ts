import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { ExtendedPrismaClient } from "./prisma.extension";

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  /**
   * Empty lifecycle hooks — the PrismaModule factory returns a Proxy whose
   * onModuleInit/onModuleDestroy perform the real $connect/$disconnect.
   * These stubs exist only so NestJS recognises the lifecycle interfaces.
   */
  async onModuleInit(): Promise<void> {}
  async onModuleDestroy(): Promise<void> {}
}

/**
 * Declaration Merging:
 * This ensures the PrismaService class is treated as an ExtendedPrismaClient by TypeScript.
 */
export interface PrismaService extends ExtendedPrismaClient {}
