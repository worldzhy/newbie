const bcrypt = require('bcryptjs');

export class CommonUtil {
  /**
   * Convert object to string
   *
   * @static
   * @memberof CommonUtil
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
   * @memberof CommonUtil
   */
  static randomCode = (length = 6) => {
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
   * @memberof CommonUtil
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
   * @memberof CommonUtil
   */
  static nowPlusMinutes = (minutes: number) => {
    const currentTime = new Date();
    return new Date(currentTime.getTime() + minutes * 60000); // 1 min = 60000 ms
  };

  /**
   * Sleep
   *
   * @param ms
   * @returns
   */
  static sleep(ms = 1000) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static shallowEqualObject(o1, o2) {
    for (const p in o1) {
      if (o1.hasOwnProperty(p)) {
        if (o1[p] !== o2[p]) {
          return false;
        }
      }
    }
    for (const p in o2) {
      if (o2.hasOwnProperty(p)) {
        if (o1[p] !== o2[p]) {
          return false;
        }
      }
    }
    return true;
  }

  static removeDuplicateObjectInList(list: any) {
    const newList = (list || []).reduce((prev: any[], cur: any) => {
      let isDuplicate = false;
      for (let i = 0; i < prev.length; i++) {
        if (this.shallowEqualObject(prev[i], cur)) {
          isDuplicate = true;
          break;
        }
      }
      if (!isDuplicate) {
        prev.push(cur);
      }
      return prev;
    }, []);
    return newList;
  }
}
