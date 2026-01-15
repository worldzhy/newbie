import crypto from 'crypto';

export const encryptString = (data: string, key: string, iv: string) => {
  const cipher = crypto.createCipheriv(
    'aes-256-cbc',
    new Uint8Array(Buffer.from(key, 'utf8')),
    new Uint8Array(Buffer.from(iv, 'utf8'))
  );
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
};

export const decryptString = (data: string, key: string, iv: string) => {
  const decipher = crypto.createDecipheriv(
    'aes-256-cbc',
    new Uint8Array(Buffer.from(key, 'utf8')),
    new Uint8Array(Buffer.from(iv, 'utf8'))
  );
  let decrypted = decipher.update(data, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};
