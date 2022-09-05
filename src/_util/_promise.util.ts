import {CommonUtil} from './_common.util';

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
      await CommonUtil.sleep(sleepTimeout);
    }
  }
  return results;
}
