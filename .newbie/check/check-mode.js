const {isNewbieDeveloper} = require('../utilities/env.util');
const {NEWBIE_DEVELOPER} = require('../constants/env.constants');
const {getEnabledMode, setEnabledMode} = require('../utilities/mode.util');
const {getEnabledMicroservices} = require('../utilities/microservices.util');

const checkMode = async () => {
  const enabledMode = await getEnabledMode();
  const isNewbieDev = await isNewbieDeveloper();
  const isNewbieDevBefore = enabledMode.isNewbieDeveloper;

  const enabledMicroservices = getEnabledMicroservices();

  if (isNewbieDevBefore === isNewbieDev) {
    return true;
  } else if (enabledMicroservices.length === 0) {
    await setEnabledMode({isNewbieDeveloper: isNewbieDev});
    return true;
  } else {
    console.warn(
      `You are trying to change the mode ${isNewbieDevBefore ? 'from Development to Production' : 'from Production to Development'}.
      
      Please follow the steps below:

      1. Set ${NEWBIE_DEVELOPER} = ${isNewbieDevBefore} in .env file.
      2. Run 'npm run newbie' in your Terminal.
      3. Disable all the microservices.
      4. Set ${NEWBIE_DEVELOPER} = ${isNewbieDev} in .env file.
      
      Then the mode will be changed.\n`
    );

    return false;
  }
};

module.exports = {
  checkMode,
};
