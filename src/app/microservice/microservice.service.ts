import {Injectable} from '@nestjs/common';
import {
  Prisma,
  Microservice,
  Project,
  MicroserviceType,
  PulumiStackType,
} from '@prisma/client';
import {PrismaService} from '../../_prisma/_prisma.service';
import {InfrastructureService} from '../infrastructure/infrastructure.service';

@Injectable()
export class MicroserviceService {
  public readonly prisma: PrismaService = new PrismaService();
  private infrastructureService = new InfrastructureService();

  listAllTypes(): string[] {
    return Object.values(MicroserviceType);
  }

  getParamsByServiceType(microserviceType: string) {
    switch (microserviceType) {
      case MicroserviceType.ACCOUNT:
        return this.infrastructureService.getParamsByStackType(
          PulumiStackType.ACCOUNT
        );
      case MicroserviceType.DATABASE:
        return this.infrastructureService.getParamsByStackType(
          PulumiStackType.DATABASE
        );
      case MicroserviceType.ELASTIC_CONTAINER_CLUSTER:
        return this.infrastructureService.getParamsByStackType(
          PulumiStackType.ELASTIC_CONTAINER_CLUSTER
        );
      case MicroserviceType.ELASTIC_SERVER_CLUSTER:
        return this.infrastructureService.getParamsByStackType(
          PulumiStackType.ELASTIC_SERVER_CLUSTER
        );
      case MicroserviceType.FILE_MANAGER:
        return this.infrastructureService.getParamsByStackType(
          PulumiStackType.FILE_MANAGER
        );
      case MicroserviceType.LOGGER:
        return this.infrastructureService.getParamsByStackType(
          PulumiStackType.LOGGER
        );
      case MicroserviceType.NETWORK:
        return this.infrastructureService.getParamsByStackType(
          PulumiStackType.NETWORK
        );
      case MicroserviceType.QUEQUE:
        return this.infrastructureService.getParamsByStackType(
          PulumiStackType.QUEQUE
        );
      default:
        return {message: 'Invalid microservice type.'};
    }
  }

  /**
   * Get a microservice
   *
   * @param {Prisma.MicroserviceWhereUniqueInput} where
   * @returns {(Promise<
   *     | (Microservice & {
   *         project: Project;
   *       })
   *     | null
   *   >)}
   * @memberof MicroserviceService
   */
  async findOne(where: Prisma.MicroserviceWhereUniqueInput): Promise<
    | (Microservice & {
        project: Project;
      })
    | null
  > {
    return await this.prisma.microservice.findUnique({
      where,
      include: {project: true},
    });
  }

  /**
   * Get many microservices
   *
   * @param {{
   *     skip?: number;
   *     take?: number;
   *     where?: Prisma.MicroserviceWhereInput;
   *     orderBy?: Prisma.MicroserviceOrderByWithRelationAndSearchRelevanceInput;
   *     select?: Prisma.MicroserviceSelect;
   *   }} params
   * @returns
   * @memberof MicroserviceService
   */
  async findMany(params: {
    skip?: number;
    take?: number;
    where?: Prisma.MicroserviceWhereInput;
    orderBy?: Prisma.MicroserviceOrderByWithRelationAndSearchRelevanceInput;
    select?: Prisma.MicroserviceSelect;
  }) {
    const {skip, take, where, orderBy, select} = params;
    return await this.prisma.microservice.findMany({
      skip,
      take,
      where,
      orderBy,
      select,
    });
  }

  /**
   * Check if exist
   *
   * @param {string} id
   * @returns
   * @memberof MicroserviceService
   */
  async checkExistence(id: string) {
    const count = await this.prisma.microservice.count({
      where: {id},
    });
    return count > 0 ? true : false;
  }

  /**
   * Create a microservice
   *
   * @param {Prisma.MicroserviceCreateInput} data
   * @returns {Promise<Microservice>}
   * @memberof MicroserviceService
   */
  async create(data: Prisma.MicroserviceCreateInput): Promise<Microservice> {
    return await this.prisma.microservice.create({
      data,
    });
  }

  /**
   * Update a microservice
   *
   * @param {{
   *     where: Prisma.MicroserviceWhereUniqueInput;
   *     data: Prisma.MicroserviceUpdateInput;
   *   }} params
   * @returns {Promise<Microservice>}
   * @memberof MicroserviceService
   */
  async update(params: {
    where: Prisma.MicroserviceWhereUniqueInput;
    data: Prisma.MicroserviceUpdateInput;
  }): Promise<Microservice> {
    const {where, data} = params;
    return await this.prisma.microservice.update({
      data,
      where,
    });
  }

  /**
   * Delete a microservice
   *
   * @param {Prisma.MicroserviceWhereUniqueInput} where
   * @returns {Promise<Microservice>}
   * @memberof MicroserviceService
   */
  async delete(
    where: Prisma.MicroserviceWhereUniqueInput
  ): Promise<Microservice> {
    return await this.prisma.microservice.delete({
      where,
    });
  }

  /* End */
}
