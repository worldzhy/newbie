const fs = require('fs');
const {ENABLED_MODE} = require('../constants/path.constants');

const getEnabledMode = () => {
  if (!fs.existsSync(ENABLED_MODE)) {
    fs.writeFileSync(
      ENABLED_MODE,
      JSON.stringify({isNewbieDeveloper: false}, null, 2)
    );
  }
  return JSON.parse(fs.readFileSync(ENABLED_MODE, 'utf8'));
};

const setEnabledMode = ({isNewbieDeveloper}) => {
  fs.writeFileSync(
    ENABLED_MODE,
    JSON.stringify({isNewbieDeveloper: isNewbieDeveloper}, null, 2)
  );
};

module.exports = {
  getEnabledMode,
  setEnabledMode,
};
