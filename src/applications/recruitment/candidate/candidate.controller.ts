import {
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Body,
  Param,
  Query,
  BadRequestException,
} from "@nestjs/common";
import {
  ApiTags,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
  ApiQuery,
} from "@nestjs/swagger";
import { Prisma, Candidate, PermissionAction } from "@prisma/client";
import { randomNumbers } from "../../../toolkits/utilities/common.util";
import { RequirePermission } from "../../account/authorization/authorization.decorator";
import { CandidateService } from "./candidate.service";

@ApiTags("[Application] Recruitment / Candidate")
@ApiBearerAuth()
@Controller("recruitment-candidates")
export class CandidateController {
  constructor(private candidateService: CandidateService) { }

  @Post("")
  @RequirePermission(PermissionAction.create, Prisma.ModelName.Candidate)
  @ApiBody({
    description: "Create a user candidate.",
    examples: {
      a: {
        summary: "1. Create",
        value: {
          givenName: "Mary",
          middleName: "Rose",
          familyName: "Johnson",
          birthday: new Date(),
          gender: "Female",
          email: "mary@hd.com",
          primaryPhone: "121289182",
          primaryPhoneExt: "232",
          alternatePhone: "7236782462",
          alternatePhoneExt: "897",
          address: "456 White Finch St. North Augusta, SC 29860",
          address2: "",
          city: "New York City",
          state: "NY",
          zipcode: "21000",
        },
      },
    },
  })
  async createCandidate(
    @Body()
    body: Prisma.LocationCreateWithoutCandidateInput &
      Prisma.CandidateProfileCreateWithoutCandidateInput
  ): Promise<Candidate> {
    const locationCreateInput: Prisma.LocationCreateWithoutCandidateInput = {
      address: body.address,
      address2: body.address2,
      city: body.city,
      state: body.state,
      zipcode: body.zipcode,
    };
    const profileCreateInput: Prisma.CandidateProfileCreateWithoutCandidateInput =
    {
      uniqueNumber: randomNumbers(9),
      givenName: body.givenName,
      middleName: body.middleName,
      familyName: body.familyName,
      birthday: body.birthday,
      gender: body.gender,
      email: body.email,
      primaryPhone: body.primaryPhone,
      primaryPhoneExt: body.primaryPhoneExt,
      alternatePhone: body.alternatePhone,
      alternatePhoneExt: body.alternatePhoneExt,
    };

    return await this.candidateService.create({
      data: {
        location: { create: locationCreateInput },
        profile: { create: profileCreateInput },
      },
    });
  }

  @Get("count")
  @RequirePermission(PermissionAction.read, Prisma.ModelName.Candidate)
  @ApiQuery({ name: "name", type: "string" })
  @ApiQuery({ name: "email", type: "string" })
  @ApiQuery({ name: "phone", type: "string" })
  async countCandidates(
    @Query() query: { name?: string; email?: string; phone?: string }
  ): Promise<number> {
    // [step 1] Construct where argument.
    let where: Prisma.CandidateWhereInput | undefined;
    const whereConditions: object[] = [];
    if (query.name && query.name.trim().length > 0) {
      whereConditions.push({
        profile: {
          fullName: {
            search: query.name
              .trim()
              .split(" ")
              .filter((word) => word !== "")
              .join("|"),
          },
        },
      });
    }
    if (query.email && query.email.trim().length > 0) {
      whereConditions.push({
        profile: { email: { contains: query.email.trim() } },
      });
    }
    if (query.phone && query.phone.trim().length > 0) {
      whereConditions.push({
        profile: { primaryPhone: { contains: query.phone.trim() } },
      });
      whereConditions.push({
        profile: { alternatePhone: { contains: query.phone.trim() } },
      });
    }

    if (whereConditions.length > 0) {
      where = { OR: whereConditions };
    }

    // [step 2] Count.
    return await this.candidateService.count({
      where: where,
    });
  }

  @Get("")
  @RequirePermission(PermissionAction.read, Prisma.ModelName.Candidate)
  @ApiQuery({ name: "name", type: "string" })
  @ApiQuery({ name: "email", type: "string" })
  @ApiQuery({ name: "phone", type: "string" })
  @ApiQuery({ name: "page", type: "number" })
  @ApiQuery({ name: "pageSize", type: "number" })
  async getCandidates(
    @Query()
    query: {
      name?: string;
      email?: string;
      phone?: string;
      page?: string;
      pageSize?: string;
    }
  ): Promise<Candidate[]> {
    // [step 1] Construct where argument.
    let where: Prisma.CandidateWhereInput | undefined;
    const whereConditions: object[] = [];
    if (query.name && query.name.trim().length > 0) {
      whereConditions.push({
        profile: {
          fullName: {
            search: query.name
              .trim()
              .split(" ")
              .filter((word) => word !== "")
              .join("|"),
          },
        },
      });
    }
    if (query.email && query.email.trim().length > 0) {
      whereConditions.push({
        profile: { email: { contains: query.email.trim() } },
      });
    }
    if (query.phone && query.phone.trim().length > 0) {
      whereConditions.push({
        profile: { primaryPhone: { contains: query.phone.trim() } },
      });
      whereConditions.push({
        profile: { alternatePhone: { contains: query.phone.trim() } },
      });
    }

    if (whereConditions.length > 0) {
      where = { OR: whereConditions };
    }

    // [step 2] Construct take and skip arguments.
    let take: number, skip: number;
    if (query.page && query.pageSize) {
      // Actually 'page' is string because it comes from URL param.
      const page = parseInt(query.page);
      const pageSize = parseInt(query.pageSize);
      if (page > 0) {
        take = pageSize;
        skip = pageSize * (page - 1);
      } else {
        throw new BadRequestException(
          "The page and pageSize must be larger than 0."
        );
      }
    } else {
      take = 10;
      skip = 0;
    }

    // [step 3] Get candidates.
    const candidates = await this.candidateService.findMany({
      where: where,
      orderBy: { updatedAt: "desc" },
      take: take,
      skip: skip,
      include: {
        location: true,
        profile: true,
        jobApplications: {
          take: 1,
          skip: 0,
          orderBy: { createdAt: 'desc' },
          include: {
            workflows: {
              include: {
                payload: true,
              },
            },
          },
        },
      },
    });

    return candidates.map((candidate) => {
      const location = candidate["location"];
      const profile = candidate["profile"];
      delete candidate["location"];
      delete candidate["profile"];
      delete location.id;
      delete location.candidateId;
      delete profile.id;
      delete profile.candidateId;

      return {
        ...candidate,
        ...location,
        ...profile,
      };
    });
  }

  @Get(":candidateId")
  @RequirePermission(PermissionAction.read, Prisma.ModelName.Candidate)
  @ApiParam({
    name: "candidateId",
    schema: { type: "string" },
    description: "The uuid of the candidate.",
    example: "fd5c948e-d15d-48d6-a458-7798e4d9921c",
  })
  async getCandidate(
    @Param("candidateId") candidateId: string
  ): Promise<Candidate | null> {
    const candidate = await this.candidateService.findUniqueOrThrow({
      where: { id: candidateId },
      include: { location: true, profile: true },
    });
    const location = candidate["location"];
    const profile = candidate["profile"];
    delete candidate["location"];
    delete candidate["profile"];
    delete location.id;
    delete location.candidateId;
    delete profile.id;
    delete profile.candidateId;

    return {
      ...candidate,
      ...location,
      ...profile,
    };
  }

  @Patch(":candidateId")
  @RequirePermission(PermissionAction.update, Prisma.ModelName.Candidate)
  @ApiParam({
    name: "candidateId",
    schema: { type: "string" },
    description: "The uuid of the candidate.",
    example: "fd5c948e-d15d-48d6-a458-7798e4d9921c",
  })
  @ApiBody({
    description: "Update a specific user candidate.",
    examples: {
      a: {
        summary: "1. Update",
        value: {
          givenName: "Robert",
          middleName: "William",
          familyName: "Smith",
          birthday: new Date(),
          gender: "Female",
          email: "mary@hd.com",
          primaryPhone: "121289182",
          primaryPhoneExt: "232",
          alternatePhone: "7236782462",
          alternatePhoneExt: "897",
          address: "456 White Finch St. North Augusta, SC 29860",
          address2: "",
          city: "New York City",
          state: "NY",
          zipcode: "21000",
        },
      },
    },
  })
  async updateCandidate(
    @Param("candidateId") candidateId: string,
    @Body()
    body: Prisma.LocationUpdateWithoutCandidateInput &
      Prisma.CandidateProfileUpdateWithoutCandidateInput
  ): Promise<Candidate> {
    return await this.candidateService.update({
      where: { id: candidateId },
      data: {
        location: {
          update: {
            address: body.address,
            address2: body.address2,
            city: body.city,
            state: body.state,
            zipcode: body.zipcode,
          },
        },
        profile: {
          update: {
            givenName: body.givenName,
            middleName: body.middleName,
            familyName: body.familyName,
            birthday: body.birthday,
            gender: body.gender,
            email: body.email,
            primaryPhone: body.primaryPhone,
            primaryPhoneExt: body.primaryPhoneExt,
            alternatePhone: body.alternatePhone,
            alternatePhoneExt: body.alternatePhoneExt,
          },
        },
      },
    });
  }

  @Delete(":candidateId")
  @RequirePermission(PermissionAction.delete, Prisma.ModelName.Candidate)
  @ApiParam({
    name: "candidateId",
    schema: { type: "string" },
    example: "b3a27e52-9633-41b8-80e9-ec3633ed8d0a",
  })
  async deleteUser(
    @Param("candidateId") candidateId: string
  ): Promise<Candidate> {
    return await this.candidateService.delete({
      where: { id: candidateId },
    });
  }

  @Get(":candidateId/job-applications")
  @RequirePermission(PermissionAction.read, Prisma.ModelName.Candidate)
  @ApiParam({
    name: "candidateId",
    schema: { type: "string" },
    description: "The uuid of the candidate.",
    example: "fd5c948e-d15d-48d6-a458-7798e4d9921c",
  })
  async getCandidateJobApplications(
    @Param("candidateId") candidateId: string
  ): Promise<Candidate> {
    return await this.candidateService.findUniqueOrThrow({
      where: { id: candidateId },
      include: {
        jobApplications: {
          include: {
            workflows: {
              orderBy: { createdAt: "desc" },
              include: {
                payload: true,
                steps: { orderBy: { createdAt: "desc" } },
              },
            },
          },
        },
      },
    });
  }

  /* End */
}
