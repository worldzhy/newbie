export enum PeopleFinderPlatforms {
  voilanorbert = 'voilanorbert',
  proxycurl = 'proxycurl',
  peopledatalabs = 'peopledatalabs',
}
export enum PeopleFinderStatus {
  pending = 'pending',
  completed = 'completed',
  failed = 'failed',
  deleted = 'deleted',
  parameterError = 'parameterError',
}

export enum PeopleFinderTaskStatus {
  pending = 'pending',
  completed = 'completed',
}
export enum PeopleFinderBatchTaskStatus {
  pending = 'pending',
  synchronizingData = 'synchronizingData',
  completed = 'completed',
}

export enum PeopleFinderBatchTaskCallBackStatus {
  pending = 'pending',
  error = 'error',
  completed = 'completed',
}

export enum PeopleFinderSourceMode {
  searchEmailByDomain = 'searchEmailByDomain',
  searchPeopleByDomain = 'searchPeopleByDomain',
  searchPeopleByLinkedin = 'searchPeopleByLinkedin',
  searchPeopleLinkedin = 'searchPeopleLinkedin',
}

export type PeopleFinderUserReq = {
  userId: string;
  userSource: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  companyDomain?: string;
  linkedin?: string;
};

export type PeopleFinderTaskBullJob = {
  /** PeopleFinderTaskId */
  id: number;
  taskBatchId: number;
  findEmail?: boolean;
  findPhone?: boolean;
} & PeopleFinderUserReq;

export type SearchFilter = {needPhone: boolean; needEmail: boolean};
