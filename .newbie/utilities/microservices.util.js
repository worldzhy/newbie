const fs = require('fs');
const {ALL_MICROSERVICES} = require('../constants/microservices.constants');
const {ENABLED_MICROSERVICES} = require('../constants/path.constants');

const getAddedMicroservices = enabledServiceNames => {
  const currentMicroservices = getEnabledMicroservices();

  return enabledServiceNames.filter(
    name =>
      Object.keys(ALL_MICROSERVICES).includes(name.trim()) &&
      !currentMicroservices.includes(name.trim())
  );
};

const getRemovedMicroservices = enabledServiceNames => {
  const currentMicroservices = getEnabledMicroservices();

  return currentMicroservices.filter(
    name => !enabledServiceNames.includes(name.trim())
  );
};

const getEnabledMicroservices = () => {
  if (!fs.existsSync(ENABLED_MICROSERVICES)) {
    fs.writeFileSync(
      ENABLED_MICROSERVICES,
      JSON.stringify({enabled: []}, null, 2)
    );
  }

  const json = JSON.parse(fs.readFileSync(ENABLED_MICROSERVICES, 'utf8'));
  if (!json.enabled) {
    json.enabled = [];
  }

  return json.enabled;
};

const updateEnabledMicroservices = enabledMicroservices => {
  fs.writeFileSync(
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
