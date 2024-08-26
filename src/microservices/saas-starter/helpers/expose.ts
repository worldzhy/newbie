import {ApprovedSubnet, Email, Session, User} from '@prisma/client';
import {Expose} from './interfaces';

/** Delete sensitive keys from an object */
export function expose<T>(item: T): Expose<T> {
  if (!item) return {} as T;
  if ((item as any as Partial<User>).password) (item as any).hasPassword = true;
  delete (item as any as Partial<User>).password;
  delete (item as any as Partial<User>).twoFactorSecret;
  delete (item as any as Partial<Session>).token;
  delete (item as any as Partial<Email>).emailSafe;
  delete (item as any as Partial<ApprovedSubnet>).subnet;
  return item;
}
