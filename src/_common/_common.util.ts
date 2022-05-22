const bcrypt = require('bcrypt');

export class Util {
  /**
   * Convert object to string
   *
   * @static
   * @memberof Util
   */
  static stringfy = (obj: unknown): string => {
    try {
      if (typeof obj === 'string') {
        return obj;
      } else {
        return JSON.stringify(obj);
      }
    } catch (error) {
      return error;
    }
  };

  /**
   * Generate a random verification code.
   *
   * @static
   * @memberof Util
   */
  static randomCode = (length: number) => {
    let result = '';
    const characters = '0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  };

  /**
   * Generate hash of a string
   *
   * @static
   * @memberof Util
   */
  static generateHash = async (password: string) => {
    // The type of env variable is string.
    const saltRounds = parseInt(
      process.env.BCRYPT_SALT_ROUNDS ? process.env.BCRYPT_SALT_ROUNDS : '10'
    );
    return await bcrypt.hash(password, saltRounds);
  };

  /**
   * Generate a datetime
   *
   * @static
   * @memberof Util
   */
  static nowPlusMinutes = (minutes: number) => {
    const currentTime = new Date();
    return new Date(currentTime.getTime() + minutes * 60000); // 1 min = 60000 ms
  };
}
