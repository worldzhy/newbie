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
    const {key, srcPath, repo, repoPath, schemaFileName, settingsFileName} =
      ALL_MICROSERVICES[name] || {};
    const schemaPath = `${srcPath}/.newbie/${schemaFileName}`;
    const settingsPath = `${srcPath}/.newbie/${settingsFileName}`;

    if (!key) return;
    execSync(`git submodule add ${repo} ${repoPath}`);
    if (schemaFileName && fs.existsSync(schemaPath)) {
      execSync(`cp -f ${schemaPath} ${ENABLED_PATH}/${schemaFileName}`);
    }
    if (settingsFileName && fs.existsSync(settingsPath)) {
      execSync(`cp -f ${settingsPath} ${ENABLED_PATH}/${settingsFileName}`);
    }
  });
};

const removeSubmodules = (addedMicroservices, removedMicroservices) => {
  if (removedMicroservices.length) {
    removedMicroservices.forEach(name => {
      const {key, srcPath, repoPath} = ALL_MICROSERVICES[name] || {};

      if (!key) {
        return;
      }
      if (isNewbiwDeveloper()) {
        execSync(`git submodule deinit -f ${repoPath}`);
        execSync(`git rm --cached ${repoPath} -r`);
        execSync(`rm -rf .git/modules/${repoPath}`);
      }
      execSync(`rm -rf ${srcPath}`);
    });
    removedMicroservices.forEach(name => {
      const {repoPath} = ALL_MICROSERVICES[name] || {};

      if (repoPath) {
        execSync(
          `git config -f .gitmodules --remove-section submodule.${repoPath}`
        );
        execSync(`git add ${GIT_MODULES}`);
      }
    });
  }
  if (!isNewbiwDeveloper() && addedMicroservices.length) {
    addedMicroservices.forEach(name => {
      const {key, srcPath, repoPath} = ALL_MICROSERVICES[name] || {};
      const newbiePath = `${srcPath}/.newbie`;

      if (!key) return;
      execSync(`cp -r ${repoPath} ${repoPath}_temp`);
      execSync(`git submodule deinit -f ${repoPath}`);
      execSync(`git rm --cached ${repoPath} -r`);
      execSync(`rm -rf .git/modules/${repoPath}`);
      execSync(`rm -rf ${srcPath}`);
      execSync(`mv ${repoPath}_temp ${repoPath}`);
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
