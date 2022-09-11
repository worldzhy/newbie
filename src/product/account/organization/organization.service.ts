import {Injectable} from '@nestjs/common';
import {PrismaService} from '../../../_prisma/_prisma.service';
import {Prisma, Organization} from '@prisma/client';

@Injectable()
export class OrganizationService {
  private prisma: PrismaService = new PrismaService();

  /**
   * Get a organization
   *
   * @param {Prisma.OrganizationWhereUniqueInput} organizationWhereUniqueInput
   * @returns {(Promise<Organization | null>)}
   * @memberof OrganizationService
   */
  async findOne(
    organizationWhereUniqueInput: Prisma.OrganizationWhereUniqueInput
  ): Promise<Organization | null> {
    return await this.prisma.organization.findUnique({
      where: organizationWhereUniqueInput,
    });
  }

  /**
   * Get many organizations
   *
   * @param {{
   *     skip?: number;
   *     take?: number;
   *     where?: Prisma.OrganizationWhereInput;
   *     orderBy?: Prisma.OrganizationOrderByWithRelationAndSearchRelevanceInput;
   *     select?: Prisma.OrganizationSelect;
   *   }} params
   * @returns
   * @memberof OrganizationService
   */
  async findMany(params: {
    skip?: number;
    take?: number;
    where?: Prisma.OrganizationWhereInput;
    orderBy?: Prisma.OrganizationOrderByWithRelationAndSearchRelevanceInput;
    select?: Prisma.OrganizationSelect;
  }) {
    const {skip, take, where, orderBy, select} = params;
    return await this.prisma.organization.findMany({
      skip,
      take,
      where,
      orderBy,
      select,
    });
  }

  /**
   * Create a organization
   *
   * @param {Prisma.OrganizationCreateInput} data
   * @returns {Promise<Organization>}
   * @memberof OrganizationService
   */
  async create(data: Prisma.OrganizationCreateInput): Promise<Organization> {
    return await this.prisma.organization.create({
      data,
    });
  }

  /**
   * Update a organization
   *
   * @param {{
   *     where: Prisma.OrganizationWhereUniqueInput;
   *     data: Prisma.OrganizationUpdateInput;
   *   }} params
   * @returns {Promise<Organization>}
   * @memberof OrganizationService
   */
  async update(params: {
    where: Prisma.OrganizationWhereUniqueInput;
    data: Prisma.OrganizationUpdateInput;
  }): Promise<Organization> {
    const {where, data} = params;
    return await this.prisma.organization.update({
      data,
      where,
    });
  }

  /**
   * Delete a organization
   *
   * @param {Prisma.OrganizationWhereUniqueInput} where
   * @returns {Promise<Organization>}
   * @memberof OrganizationService
   */
  async delete(
    where: Prisma.OrganizationWhereUniqueInput
  ): Promise<Organization> {
    return await this.prisma.organization.delete({
      where,
    });
  }

  /* End */
}
