const fs = require('fs');
const {execSync} = require('child_process');
const {
  ALL_MICROSERVICES,
  MICROSERVICES_CODE_PATH,
} = require('../newbie.constants');
const {getEnabledMicroservices} = require('../.db/microservices');

const assembleDependencies = (addedMicroservices, removedMicroservices) => {
  // [step 1] Add dependencies.
  const willBeAddedDependencies = [];
  const willBeAddedDevDependencies = [];
  addedMicroservices.forEach(name => {
    const {key, settingsFileName} = ALL_MICROSERVICES[name] || {};
    if (!key || !settingsFileName) {
      return;
    }

    const settingsFilePath =
      MICROSERVICES_CODE_PATH + '/' + key + '/' + settingsFileName;

    if (fs.existsSync(settingsFilePath)) {
      const {dependencies = {}, devDependencies = {}} = JSON.parse(
        fs.readFileSync(settingsFilePath, {encoding: 'utf8', flag: 'r'})
      );

      willBeAddedDependencies.push(
        ...Object.keys(dependencies).map(key => key + '@' + dependencies[key])
      );
      willBeAddedDevDependencies.push(
        ...Object.keys(devDependencies).map(
          key => key + '@' + devDependencies[key]
        )
      );
    } else {
      console.error(`[Error] Missing settings.json for microservice<${name}>!`);
    }
  });

  if (
    willBeAddedDependencies.length > 0 ||
    willBeAddedDevDependencies.length > 0
  ) {
    execSync(
      `npm install ${willBeAddedDependencies.toString().replaceAll(',', ' ')}`
    );
    execSync(
      `npm install --save-dev ${willBeAddedDevDependencies
        .toString()
        .replaceAll(',', ' ')}`
    );
  }

  // [step 2] Remove dependencies.
  const enabledDependencies = [];
  const enabledDevDependencies = [];
  getEnabledMicroservices().forEach(name => {
    const {key, settingsFileName} = ALL_MICROSERVICES[name] || {};
    if (!key || !settingsFileName) {
      return;
    }

    const settingsFilePath =
      MICROSERVICES_CODE_PATH + '/' + key + '/' + settingsFileName;

    if (fs.existsSync(settingsFilePath)) {
      const {dependencies = {}, devDependencies = {}} = JSON.parse(
        fs.readFileSync(settingsFilePath, {encoding: 'utf8', flag: 'r'})
      );

      enabledDependencies.push(...Object.keys(dependencies));
      enabledDevDependencies.push(...Object.keys(devDependencies));
    }
  });

  const willBeRemovedDependencies = [];
  const willBeRemovedDevDependencies = [];
  removedMicroservices.forEach(name => {
    const {key, settingsFileName} = ALL_MICROSERVICES[name] || {};
    if (!key || !settingsFileName) {
      return;
    }

    const settingsFilePath =
      MICROSERVICES_CODE_PATH + '/' + key + '/' + settingsFileName;

    if (fs.existsSync(settingsFilePath)) {
      const {dependencies = {}, devDependencies = {}} = JSON.parse(
        fs.readFileSync(settingsFilePath, {encoding: 'utf8', flag: 'r'})
      );

      Object.keys(dependencies).forEach(key => {
        if (!enabledDependencies.includes(key))
          willBeRemovedDependencies.push(key);
      });
      Object.keys(devDependencies).forEach(key => {
        if (!enabledDevDependencies.includes(key))
          willBeRemovedDevDependencies.push(key);
      });
    } else {
      console.error(`[Error] Missing settings.json for microservice<${name}>!`);
    }
  });

  if (
    willBeRemovedDependencies.length > 0 ||
    willBeRemovedDevDependencies.length > 0
  ) {
    execSync(
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
