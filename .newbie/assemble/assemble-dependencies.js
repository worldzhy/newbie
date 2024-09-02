const fs = require('fs/promises');
const {exec} = require('../utilities/exec.util');
const {exists} = require('../utilities/exists.util');
const {ENABLED_PATH} = require('../constants/path.constants');
const {ALL_MICROSERVICES} = require('../constants/microservices.constants');
const {getEnabledMicroservices} = require('../utilities/microservices.util');

const assembleDependencies = async (
  addedMicroservices,
  removedMicroservices
) => {
  // [step 1] Add dependencies.
  const willBeAddedDependencies = [];
  const willBeAddedDevDependencies = [];

  for (let i = 0; i < addedMicroservices.length; i++) {
    const name = addedMicroservices[i];
    const {key, settingsFileName} = ALL_MICROSERVICES[name] || {};

    if (!key || !settingsFileName) {
      return;
    }
    const settingsFilePath = `${ENABLED_PATH}/${key}/${settingsFileName}`;
    const isExists = await exists(settingsFilePath);

    if (isExists) {
      const file = await fs.readFile(settingsFilePath, {
        encoding: 'utf8',
        flag: 'r',
      });
      const {dependencies = {}, devDependencies = {}} = JSON.parse(file);

      willBeAddedDependencies.push(
        ...Object.keys(dependencies).map(key => key + '@' + dependencies[key])
      );
      willBeAddedDevDependencies.push(
        ...Object.keys(devDependencies).map(
          key => key + '@' + devDependencies[key]
        )
      );
    } else {
      console.error(`[Error] Missing ${name}.settings.json`);
    }
  }

  if (
    willBeAddedDependencies.length > 0 ||
    willBeAddedDevDependencies.length > 0
  ) {
    await exec(
      `npm install ${willBeAddedDependencies.toString().replaceAll(',', ' ')}`
    );
    await exec(
      `npm install --save-dev ${willBeAddedDevDependencies
        .toString()
        .replaceAll(',', ' ')}`
    );
  }

  // [step 2] Remove dependencies.
  const enabledDependencies = [];
  const enabledDevDependencies = [];
  const microservices = await getEnabledMicroservices();

  for (let i = 0; i < microservices.length; i++) {
    const name = microservices[i];
    const {key, settingsFileName} = ALL_MICROSERVICES[name] || {};

    if (!key || !settingsFileName) {
      return;
    }
    const settingsFilePath = `${ENABLED_PATH}/${key}/${settingsFileName}`;
    const isExists = await exists(settingsFilePath);

    if (isExists) {
      const file = await fs.readFile(settingsFilePath, {
        encoding: 'utf8',
        flag: 'r',
      });
      const {dependencies = {}, devDependencies = {}} = JSON.parse(file);

      enabledDependencies.push(...Object.keys(dependencies));
      enabledDevDependencies.push(...Object.keys(devDependencies));
    }
  }
  const willBeRemovedDependencies = [];
  const willBeRemovedDevDependencies = [];

  for (let i = 0; i < removedMicroservices.length; i++) {
    const name = removedMicroservices[i];
    const {key, settingsFileName} = ALL_MICROSERVICES[name] || {};

    if (!key || !settingsFileName) {
      return;
    }
    const settingsFilePath = `${ENABLED_PATH}/${key}/${settingsFileName}`;
    const isExists = await exists(settingsFilePath);

    if (isExists) {
      const file = await fs.readFile(settingsFilePath, {
        encoding: 'utf8',
        flag: 'r',
      });
      const {dependencies = {}, devDependencies = {}} = JSON.parse(file);

      Object.keys(dependencies).forEach(key => {
        if (!enabledDependencies.includes(key))
          willBeRemovedDependencies.push(key);
      });
      Object.keys(devDependencies).forEach(key => {
        if (!enabledDevDependencies.includes(key))
          willBeRemovedDevDependencies.push(key);
      });
    } else {
      console.error(`[Error] Missing ${name}.settings.json`);
    }
  }

  if (
    willBeRemovedDependencies.length > 0 ||
    willBeRemovedDevDependencies.length > 0
  ) {
    await exec(
      `npm uninstall ${willBeRemovedDependencies
        .toString()
        .replaceAll(',', ' ')} ${willBeRemovedDevDependencies
        .toString()
        .replaceAll(',', ' ')}`
    );
  }
};

module.exports = {
  assembleDependencies,
};
