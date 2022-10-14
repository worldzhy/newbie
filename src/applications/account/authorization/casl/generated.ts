import {Subjects} from '@casl/prisma';
import {
  Candidate,
  CandidateCertification,
  CandidateTesting,
  CandidateTraining,
  CloudFormationStack,
  DatatransMission,
  DatatransPipeline,
  ElasticsearchDataboard,
  ElasticsearchDataboardColumn,
  ElasticsearchDatasource,
  ElasticsearchDatasourceIndex,
  ElasticsearchDatasourceIndexField,
  Job,
  JobApplication,
  JobApplicationNote,
  JobApplicationProcessingStep,
  JobApplicationTask,
  Organization,
  Permission,
  PostgresqlDatasource,
  PostgresqlDatasourceConstraint,
  PostgresqlDatasourceTable,
  PostgresqlDatasourceTableColumn,
  Project,
  ProjectCheckpoint,
  ProjectEnvironment,
  PulumiStack,
  Role,
  User,
  UserJwt,
  UserProfile,
} from '@prisma/client';

export type PrismaSubjects = Subjects<{
  // Account resources
  Organization: Organization;
  Role: Role;
  User: User;
  UserJwt: UserJwt;
  UserProfile: UserProfile;
  Permission: Permission;
  // Project management resources
  Project: Project;
  ProjectCheckpoint: ProjectCheckpoint;
  ProjectEnvironment: ProjectEnvironment;
  CloudFormationStack: CloudFormationStack;
  PulumiStack: PulumiStack;
  // EngineD resources
  PostgresqlDatasource: PostgresqlDatasource;
  PostgresqlDatasourceConstraint: PostgresqlDatasourceConstraint;
  PostgresqlDatasourceTable: PostgresqlDatasourceTable;
  PostgresqlDatasourceTableColumn: PostgresqlDatasourceTableColumn;
  ElasticsearchDatasource: ElasticsearchDatasource;
  ElasticsearchDatasourceIndex: ElasticsearchDatasourceIndex;
  ElasticsearchDatasourceIndexField: ElasticsearchDatasourceIndexField;
  DatatransPipeline: DatatransPipeline;
  DatatransMission: DatatransMission;
  ElasticsearchDataboard: ElasticsearchDataboard;
  ElasticsearchDataboardColumn: ElasticsearchDataboardColumn;
  // Recruitment resources
  Candidate: Candidate;
  CandidateCertification: CandidateCertification;
  CandidateTraining: CandidateTraining;
  CandidateTesting: CandidateTesting;
  Job: Job;
  JobApplication: JobApplication;
  JobApplicationProcessingStep: JobApplicationProcessingStep;
  JobApplicationNote: JobApplicationNote;
  JobApplicationTask: JobApplicationTask;
}>;
