const fs = require('fs');
const {
  ENABLED_PATH,
  GIT_MODULES,
  NEWBIE_DEVELOPER,
  ALL_MICROSERVICES,
} = require('../constants/newbie.constants');
const {execSync} = require('child_process');
const {getObjectFromEnvFile} = require('../utilities/env.util');

const envObj = getObjectFromEnvFile();

const isNewbiwDeveloper = () => envObj[NEWBIE_DEVELOPER] === 'true';

const cloneGitSubmodules = addedMicroservices => {
  addedMicroservices.forEach(name => {
    const {key, srcPath, repositoryUrl} = ALL_MICROSERVICES[name] || {};
    const microserviceNewbiePath = `${srcPath}/.newbie`;

    if (!key) return;
    try {
      execSync(`git submodule add ${repositoryUrl} ${srcPath}`);
    } catch (error) {
      execSync(`git submodule deinit -f ${srcPath}`);
      execSync(`git rm -r --cached ${srcPath}`);
      execSync(`rm -rf .git/modules/${srcPath}`);
      execSync(`git submodule add ${repositoryUrl} ${srcPath}`);
    }

    if (microserviceNewbiePath && fs.existsSync(microserviceNewbiePath)) {
      execSync(`cp -rf ${microserviceNewbiePath} ${ENABLED_PATH}/${key}`);
    }
  });
};

const removeSubmodules = (addedMicroservices, removedMicroservices) => {
  if (removedMicroservices.length) {
    removedMicroservices.forEach(name => {
      const {key, srcPath} = ALL_MICROSERVICES[name] || {};

      if (!key) {
        return;
      }
      if (isNewbiwDeveloper()) {
        execSync(`git submodule deinit -f ${srcPath}`);
        execSync(`git rm -r --cached ${srcPath}`);
        execSync(`rm -rf .git/modules/${srcPath}`);
      }
      execSync(`rm -rf ${srcPath}`);
    });
    removedMicroservices.forEach(name => {
      const {srcPath} = ALL_MICROSERVICES[name] || {};

      if (srcPath) {
        try {
          execSync(
            `git config -f .gitmodules --remove-section submodule.${srcPath}`
          );
        } catch (error) {}

        execSync(`git add ${GIT_MODULES}`);
      }
    });
  }
  if (!isNewbiwDeveloper() && addedMicroservices.length) {
    addedMicroservices.forEach(name => {
      const {key, srcPath} = ALL_MICROSERVICES[name] || {};
      const newbiePath = `${srcPath}/.newbie`;

      if (!key) return;
      execSync(`cp -r ${srcPath} ${srcPath}_temp`);
      execSync(`git submodule deinit -f ${srcPath}`);
      execSync(`git rm --cached ${srcPath} -r`);
      execSync(`rm -rf .git/modules/${srcPath}`);
      execSync(`rm -rf ${srcPath}`);
      execSync(`mv ${srcPath}_temp ${srcPath}`);
      if (fs.existsSync(newbiePath)) {
        execSync(`rm -rf ${newbiePath}`);
      }
    });
  }
};

const assembleSubmodules = (addedMicroservices, removedMicroservices) => {
  cloneGitSubmodules(addedMicroservices);
  removeSubmodules(addedMicroservices, removedMicroservices);
};

module.exports = {
  assembleSubmodules,
};
