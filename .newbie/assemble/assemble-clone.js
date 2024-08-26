const fs = require('fs');
const {execSync} = require('child_process');
const {GIT_MODULES, ALL_MICROSERVICES} = require('../newbie.constants');

const cloneSubmodules = addedMicroservices => {
  addedMicroservices.forEach(name => {
    const {repo, repoPath} = ALL_MICROSERVICES[name] || {};

    if (!repo || !repoPath) {
      return;
    } else {
      execSync(`git submodule add ${repo} ${repoPath}`);
    }
  });
};

const removeSubmodules = removedMicroservices => {
  if (removedMicroservices.length && fs.existsSync(GIT_MODULES)) {
    removedMicroservices.forEach(name => {
      const {key, srcPath, repoPath} = ALL_MICROSERVICES[name] || {};

      if (!key) {
        return;
      } else {
        execSync(`git submodule deinit -f ${repoPath}`);
        execSync(`git rm --cached ${repoPath} -r`);
        execSync(`rm -rf .git/modules/${repoPath}`);
        execSync(`rm -rf ${srcPath}`);
      }
    });
    removedMicroservices.forEach(name => {
      const {key, repoPath} = ALL_MICROSERVICES[name] || {};

      if (!key) {
        return;
      } else {
        execSync(
          `git config -f .gitmodules --remove-section submodule.${repoPath}`
        );
        execSync(`git add ${GIT_MODULES}`);
      }
    });
  }
};

module.exports = {
  cloneSubmodules,
  removeSubmodules,
};
