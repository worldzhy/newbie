const util = require('util');
const fs = require('fs/promises');

const exec = util.promisify(require('child_process').exec);

const exists = async path => {
  try {
    await fs.stat(path);
  } catch {
    return false;
  }
  return true;
};

module.exports = {
  exec,
  exists,
};
