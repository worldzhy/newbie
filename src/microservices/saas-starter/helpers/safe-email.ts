const normalizeEmail = require('normalize-email');

/**
 * Converts an email address to a unqiue, safe email
 * @param email - Valid email address
 */
export const safeEmail = (input: string) => {
  return normalizeEmail(input.toLowerCase().trim());
};
