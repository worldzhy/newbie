const {NEWBIE_DEVELOPER} = require('../constants/env.constants');
const {isNewbieDeveloper} = require('../utilities/env.util');
const {getEnabledMicroservices} = require('../utilities/microservices.util');
const {getEnabledMode, setEnabledMode} = require('../utilities/mode.util');

const checkMode = () => {
  const isNewbieDeveloperBefore = getEnabledMode().isNewbieDeveloper;
  const isNewbieDeveloperAfter = isNewbieDeveloper;

  const enabledMicroservices = getEnabledMicroservices();

  if (isNewbieDeveloperBefore === isNewbieDeveloperAfter) {
    return true;
  } else if (enabledMicroservices.length === 0) {
    setEnabledMode({isNewbieDeveloper: isNewbieDeveloperAfter});
    return true;
  } else {
    console.warn(
      `You are trying to change the mode ${isNewbieDeveloperBefore ? 'from Development to Production' : 'from Production to Development'}.
      
      Please follow the steps below:

      1. Set ${NEWBIE_DEVELOPER} = ${isNewbieDeveloperBefore} in .env file.
      2. Run 'npm run newbie' in your Terminal.
      3. Disable all the microservices.
      4. Set ${NEWBIE_DEVELOPER} = ${isNewbieDeveloperAfter} in .env file.
      
      Then the mode will be changed.\n`
    );

    return false;
  }
};

module.exports = {
  checkMode,
};
