const fs = require('fs/promises');
const {exists} = require('../utilities/exists.util');
const {ENABLED_MICROSERVICES} = require('../constants/path.constants');
const {ALL_MICROSERVICES} = require('../constants/microservices.constants');

const getAddedMicroservices = async enabledServiceNames => {
  const currentMicroservices = await getEnabledMicroservices();

  return enabledServiceNames.filter(
    name =>
      Object.keys(ALL_MICROSERVICES).includes(name.trim()) &&
      !currentMicroservices.includes(name.trim())
  );
};

const getRemovedMicroservices = async enabledServiceNames => {
  const currentMicroservices = await getEnabledMicroservices();

  return currentMicroservices.filter(
    name => !enabledServiceNames.includes(name.trim())
  );
};

const getEnabledMicroservices = async () => {
  const isExists = await exists(ENABLED_MICROSERVICES);

  if (!isExists) {
    await fs.writeFile(
      ENABLED_MICROSERVICES,
      JSON.stringify({enabled: []}, null, 2)
    );
  }
  const file = await fs.readFile(ENABLED_MICROSERVICES, 'utf8');
  const json = JSON.parse(file);

  if (!json.enabled) {
    json.enabled = [];
  }
  return json.enabled;
};

const updateEnabledMicroservices = async enabledMicroservices => {
  await fs.writeFile(
    ENABLED_MICROSERVICES,
    JSON.stringify({enabled: enabledMicroservices}, null, 2)
  );
};

module.exports = {
  getAddedMicroservices,
  getRemovedMicroservices,
  getEnabledMicroservices,
  updateEnabledMicroservices,
};
