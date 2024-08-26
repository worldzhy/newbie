import * as _ from 'lodash';

/**
  const a = [1, 2, 3];
  const b = [2, 1, 3];

  const c = ['123', '456', '777'];
  const d = ['123', '777', '456'];

  compareArraysContent(a, b); // true
  compareArraysContent(c, d); // true
 */
export function compareArraysContent(
  array1: Array<string | number>,
  array2: Array<string | number>
) {
  const result1 = _.difference(array1, array2);
  const result2 = _.difference(array2, array1);

  return result1.length === 0 && result2.length === 0;
}

/**
  const a = [1, 2, 3];
  const b = [2, 1, 3];

  const c = [['a'], ['b'], ['c']];
  const d = [['a'], ['b'], ['c']];

  const e = [['a'], ['b'], ['c']];
  const f = [['b'], ['a'], ['c']];

  const g = ['123', '456', '777'];
  const h = ['123', '456', '777'];

  const i = ['123', '456', '777'];
  const j = ['123', '777', '456'];

  compareArrays(a, b); // false
  compareArrays(c, d); // true
  compareArrays(e, f); // false
  compareArrays(g, h); // true
  compareArrays(i, j); // false
 */
export function compareArrays(array1: Array<any>, array2: Array<any>) {
  // if the other array is a falsy value, return
  if (!array2) return false;
  // if the argument is the same array, we can be sure the contents are same as well
  if (array2 === array1) return true;
  // compare lengths - can save a lot of time
  if (array1.length !== array2.length) return false;

  for (let i = 0, l = array1.length; i < l; i++) {
    // Check if we have nested arrays
    if (array1[i] instanceof Array && array2[i] instanceof Array) {
      // recurse into the nested arrays
      if (!compareArrays(array1[i], array2[i])) return false;
    } else if (array1[i] !== array2[i]) {
      // Warning - two different object instances will never be equal: {x:20} != {x:20}
      return false;
    }
  }

  return true;
}
