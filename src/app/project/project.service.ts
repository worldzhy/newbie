import {Injectable} from '@nestjs/common';
import {Prisma, Project} from '@prisma/client';
import {PrismaService} from '../../_prisma/_prisma.service';

@Injectable()
export class ProjectService {
  public readonly prisma: PrismaService = new PrismaService();

  /**
   * Get a project
   *
   * @param {Prisma.ProjectWhereUniqueInput} ProjectWhereUniqueInput
   * @returns {(Promise<Project | null>)}
   * @memberof ProjectProject
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
   * @memberof ProjectProject
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
   * Create a project
   *
   * @param {Prisma.ProjectCreateInput} data
   * @returns {Promise<Project>}
   * @memberof ProjectProject
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
   * @memberof ProjectProject
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
   * @memberof ProjectProject
   */
  async delete(where: Prisma.ProjectWhereUniqueInput): Promise<Project> {
    return await this.prisma.project.delete({
      where,
    });
  }

  /* End */
}
