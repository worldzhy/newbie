import {Injectable} from '@nestjs/common';
import {Prisma, Microservice, Project} from '@prisma/client';
import {PrismaService} from '../../../_prisma/_prisma.service';

@Injectable()
export class MicroserviceService {
  private prisma: PrismaService = new PrismaService();

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

  async findMany(where: Prisma.MicroserviceWhereInput) {
    return await this.prisma.microservice.findMany({
      where,
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
