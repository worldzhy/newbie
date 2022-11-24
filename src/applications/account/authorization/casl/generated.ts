import {Subjects} from '@casl/prisma';
import {
  Candidate,
  CandidateCertification,
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
  UserToken,
  UserProfile,
} from '@prisma/client';

export type PrismaSubjects = Subjects<{
  // Account resources
  Organization: Organization;
  Role: Role;
  User: User;
  UserToken: UserToken;
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
  Job: Job;
  JobApplication: JobApplication;
  JobApplicationNote: JobApplicationNote;
  JobApplicationTask: JobApplicationTask;
}>;
