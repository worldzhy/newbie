const fs = require('fs/promises');

const exists = async path => {
  try {
    await fs.stat(path);
  } catch {
    return false;
  }
  return true;
};

module.exports = {
  exists,
};
