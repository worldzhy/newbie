const fs = require('fs/promises');
const {exists} = require('../utilities/exists.util');
const {
  CONFIG_JSON,
  MICROSERVICES_PATH,
} = require('../constants/path.constants');
const {ALL_MICROSERVICES} = require('../constants/microservices.constants');

/*
 * Functions to manage microservices in the configuration file
 */

const getMicroservicesInConfig = async () => {
  const isExists = await exists(CONFIG_JSON);

  if (!isExists) {
    await fs.writeFile(CONFIG_JSON, JSON.stringify({enabled: []}, null, 2));
  }
  const file = await fs.readFile(CONFIG_JSON, 'utf8');
  const json = JSON.parse(file);

  if (!json.enabled) {
    json.enabled = [];
  }
  return json.enabled;
};

const getMicroservicesToBeAddedToConfig = async newEnabledMicroservices => {
  const microservicesInConfig = await getMicroservicesInConfig();

  return newEnabledMicroservices.filter(
    name =>
      Object.keys(ALL_MICROSERVICES).includes(name.trim()) &&
      !microservicesInConfig.includes(name.trim())
  );
};

const getMicroservicesToBeRemovedFromConfig = async newEnabledMicroservices => {
  const microservicesInConfig = await getMicroservicesInConfig();

  return microservicesInConfig.filter(
    name => !newEnabledMicroservices.includes(name.trim())
  );
};

const updateMicroservicesInConfig = async newEnabledMicroservices => {
  const file = await fs.readFile(CONFIG_JSON, 'utf8');
  const obj = JSON.parse(file);
  obj.enabled = newEnabledMicroservices;

  await fs.writeFile(CONFIG_JSON, JSON.stringify(obj, null, 2));
};

/*
 * Functions to manage microservices in the project
 */

const getMicroservicesInProject = async () => {
  // Get existed folders under the src/microservices folder
  const dirents = await fs.readdir(MICROSERVICES_PATH, {
    withFileTypes: true,
  });

  return dirents
    .filter(dirent => {
      return dirent.isDirectory();
    })
    .map(dirent => {
      return dirent.name;
    });
};

const getMicroservicesToBeInstalledToProject = async () => {
  const microservicesInConfig = await getMicroservicesInConfig();
  const microservicesInProject = await getMicroservicesInProject();

  // Filter out microservices that are in the config but not in the project
  return microservicesInConfig.filter(
    name => !microservicesInProject.includes(name.trim())
  );
};

const getMicroservicesToBeUninstalledFromProject = async () => {
  const microservicesInConfig = await getMicroservicesInConfig();
  const microservicesInProject = await getMicroservicesInProject();

  // Filter out microservices that are in the project but not in the config
  return microservicesInProject.filter(
    name => !microservicesInConfig.includes(name.trim())
  );
};

module.exports = {
  getMicroservicesInConfig,
  getMicroservicesToBeAddedToConfig,
  getMicroservicesToBeRemovedFromConfig,
  updateMicroservicesInConfig,

  getMicroservicesInProject,
  getMicroservicesToBeInstalledToProject,
  getMicroservicesToBeUninstalledFromProject,
};
