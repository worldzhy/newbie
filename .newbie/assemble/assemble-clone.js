const fs = require('fs');
const {
  GIT_MODULES,
  NEWBIE_DEVELOPER,
  ALL_MICROSERVICES,
} = require('../newbie.constants');
const {execSync} = require('child_process');
const {getObjectFromEnvFile} = require('../.db/env');

const envObj = getObjectFromEnvFile();

const isNewbiwDeveloper = () => envObj[NEWBIE_DEVELOPER] === 'true';

const cloneSubmodules = addedMicroservices => {
  addedMicroservices.forEach(name => {
    const {repo, repoPath} = ALL_MICROSERVICES[name] || {};

    if (repo && repoPath) {
      execSync(`git submodule add ${repo} ${repoPath}`);
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
      const {srcPath, repoPath} = ALL_MICROSERVICES[name] || {};

      if (srcPath && repoPath) {
        execSync(`cp -r ${repoPath} ${repoPath}_temp`);
        execSync(`git submodule deinit -f ${repoPath}`);
        execSync(`git rm --cached ${repoPath} -r`);
        execSync(`rm -rf .git/modules/${repoPath}`);
        execSync(`rm -rf ${srcPath}`);
        execSync(`mv ${repoPath}_temp ${repoPath}`);
      }
    });
  }
};

module.exports = {
  cloneSubmodules,
  removeSubmodules,
};
