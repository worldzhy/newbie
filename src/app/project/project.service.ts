import {Injectable} from '@nestjs/common';
import {Prisma, Project} from '@prisma/client';
import {PrismaService} from '../../_prisma/_prisma.service';

@Injectable()
export class ProjectService {
  private prisma: PrismaService = new PrismaService();

  /**
   * Get a project
   * @param {Prisma.ProjectWhereUniqueInput} where
   * @returns {(Promise<Project | null>)}
   * @memberof ProjectService
   */
  async findOne(
    where: Prisma.ProjectWhereUniqueInput
  ): Promise<Project | null> {
    return await this.prisma.project.findUnique({
      where,
    });
  }

  /**
   * Get many projects
   *
   * @param {{
   *     skip?: number;
   *     take?: number;
   *     where?: Prisma.ProjectWhereInput;
   *     orderBy?: Prisma.ProjectOrderByWithRelationAndSearchRelevanceInput;
   *     select?: Prisma.ProjectSelect;
   *   }} params
   * @returns
   * @memberof ProjectService
   */
  async findMany(params: {
    skip?: number;
    take?: number;
    where?: Prisma.ProjectWhereInput;
    orderBy?: Prisma.ProjectOrderByWithRelationAndSearchRelevanceInput;
    select?: Prisma.ProjectSelect;
  }) {
    const {skip, take, where, orderBy, select} = params;
    return await this.prisma.project.findMany({
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
   * @memberof ProjectService
   */
  async checkExistence(id: string) {
    const count = await this.prisma.project.count({
      where: {id},
    });
    return count > 0 ? true : false;
  }

  /**
   * Create a project
   *
   * @param {Prisma.ProjectCreateInput} data
   * @returns {Promise<Project>}
   * @memberof ProjectService
   */
  async create(data: Prisma.ProjectCreateInput): Promise<Project> {
    return await this.prisma.project.create({
      data,
    });
  }

  /**
   * Update a project
   *
   * @param {{
   *     where: Prisma.ProjectWhereUniqueInput;
   *     data: Prisma.ProjectUpdateInput;
   *   }} params
   * @returns {Promise<Project>}
   * @memberof ProjectService
   */
  async update(params: {
    where: Prisma.ProjectWhereUniqueInput;
    data: Prisma.ProjectUpdateInput;
  }): Promise<Project> {
    const {where, data} = params;
    return await this.prisma.project.update({
      data,
      where,
    });
  }

  /**
   * Delete a project
   *
   * @param {Prisma.ProjectWhereUniqueInput} where
   * @returns {Promise<Project>}
   * @memberof ProjectService
   */
  async delete(where: Prisma.ProjectWhereUniqueInput): Promise<Project> {
    return await this.prisma.project.delete({
      where,
    });
  }

  /* End */
}
