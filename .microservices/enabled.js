const fs = require('fs');
const {ALL_MICROSERVICES, ENABLED_MICROSERVICES_PATH} = require('./constants');

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
  if (!fs.existsSync(ENABLED_MICROSERVICES_PATH)) {
    fs.writeFileSync(
      ENABLED_MICROSERVICES_PATH,
      JSON.stringify({microservices: []}, null, 2)
    );
  }

  const enabled = JSON.parse(
    fs.readFileSync(ENABLED_MICROSERVICES_PATH, 'utf8')
  );
  if (!enabled.microservices) {
    enabled.microservices = [];
  }

  return enabled.microservices;
};

const updateEnabledMicroservices = enabledMicroservices => {
  fs.writeFileSync(
    ENABLED_MICROSERVICES_PATH,
    JSON.stringify({microservices: enabledMicroservices}, null, 2)
  );
};

module.exports = {
  getAddedMicroservices,
  getRemovedMicroservices,
  getEnabledMicroservices,
  updateEnabledMicroservices,
};
