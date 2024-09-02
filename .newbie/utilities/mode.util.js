const fs = require('fs/promises');
const {exists} = require('../utilities/exists.util');
const {ENABLED_MODE} = require('../constants/path.constants');

const getEnabledMode = async () => {
  const isExists = await exists(ENABLED_MODE);

  if (!isExists) {
    await fs.writeFile(
      ENABLED_MODE,
      JSON.stringify({isNewbieDeveloper: false}, null, 2)
    );
  }
  const file = await fs.readFile(ENABLED_MODE, 'utf8');

  return JSON.parse(file);
};

const setEnabledMode = async ({isNewbieDeveloper}) => {
  await fs.writeFile(
    ENABLED_MODE,
    JSON.stringify({isNewbieDeveloper: isNewbieDeveloper}, null, 2)
  );
};

module.exports = {
  getEnabledMode,
  setEnabledMode,
};
