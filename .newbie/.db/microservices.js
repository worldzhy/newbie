const fs = require('fs');
const {ALL_MICROSERVICES, MICROSERVICES_JSON} = require('../constants');

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
  if (!fs.existsSync(MICROSERVICES_JSON)) {
    fs.writeFileSync(
      MICROSERVICES_JSON,
      JSON.stringify({enabled: []}, null, 2)
    );
  }

  const json = JSON.parse(fs.readFileSync(MICROSERVICES_JSON, 'utf8'));
  if (!json.enabled) {
    json.enabled = [];
  }

  return json.enabled;
};

const updateEnabledMicroservices = enabledMicroservices => {
  fs.writeFileSync(
    MICROSERVICES_JSON,
    JSON.stringify({enabled: enabledMicroservices}, null, 2)
  );
};

module.exports = {
  getAddedMicroservices,
  getRemovedMicroservices,
  getEnabledMicroservices,
  updateEnabledMicroservices,
};
