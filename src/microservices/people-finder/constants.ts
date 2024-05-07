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

export type PeopleFinderBullJob = {
  email?: string;
  phone?: string;
  userId: string;
  userSource: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  companyDomain?: string;
  linkedin?: string;
  taskId: string;
};

export type SearchFilter = {phone: boolean; email: boolean};
