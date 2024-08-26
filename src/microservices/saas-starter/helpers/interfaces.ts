export type Files = {
  fieldname: string;
  originalname: string;
  encoding: '7bit';
  mimetype: string;
  buffer: Buffer;
  size: number;
}[];

export type Expose<T> = Omit<
  Omit<
    Omit<Omit<Omit<T, 'password'>, 'twoFactorSecret'>, 'token'>,
    'emailSafe'
  >,
  'subnet'
>;
