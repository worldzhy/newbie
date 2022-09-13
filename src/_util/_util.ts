const bcrypt = require('bcryptjs');

/**
 * Convert object to string
 *
 * @static
 * @memberof Util
 */
export function stringfy(obj: unknown): string {
  try {
    if (typeof obj === 'string') {
      return obj;
    } else {
      return JSON.stringify(obj);
    }
  } catch (error) {
    return error;
  }
}

/**
 * Generate a random verification code.
 *
 * @static
 * @memberof Util
 */
export function randomCode(length = 6) {
  let result = '';
  const characters = '0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

/**
 * Generate hash of a string
 *
 * @static
 * @memberof Util
 */
export async function generateHash(password: string) {
  // The type of env variable is string.
  const saltRounds = parseInt(
    process.env.BCRYPT_SALT_ROUNDS ? process.env.BCRYPT_SALT_ROUNDS : '10'
  );
  return await bcrypt.hash(password, saltRounds);
}

/**
 * Generate a datetime
 *
 * @static
 * @memberof Util
 */
export function nowPlusMinutes(minutes: number) {
  const currentTime = new Date();
  return new Date(currentTime.getTime() + minutes * 60000); // 1 min = 60000 ms
}

/**
 * Sleep
 *
 * @param ms
 * @returns
 */
export function sleep(ms = 1000) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function shallowEqualObject(o1, o2) {
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

export function removeDuplicateObjectInList(list: any) {
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

export async function promiseBatch(
  paramList,
  func,
  concurrency = 1,
  sleepTimeout = 0
) {
  const pList = paramList.slice(0);
  let results: any[] = [];
  while (pList.length) {
    const result = await Promise.all(
      pList.splice(0, concurrency).map(it => func(it))
    );
    results = results.concat(result);
    if (sleepTimeout > 0) {
      await sleep(sleepTimeout);
    }
  }
  return results;
}
