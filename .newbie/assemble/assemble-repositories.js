const fs = require('fs');
const {ALL_MICROSERVICES} = require('../constants/microservices.constants');
const {ENABLED_PATH, GIT_MODULES} = require('../constants/path.constants');
const {execSync} = require('child_process');
const {isNewbieDeveloper} = require('../utilities/env.util');

/**
 * ! Related files:
 *
 * .gitmodules file
 * .git/config file
 * .git/modules/... folder
 *
 */

/**
 * execSync(`git submodule add ${repositoryUrl} ${srcPath}`)
 *
 * ! Possible errors:
 *
 * ! `...already exists in the index`
 * How to handle it?
 * - Run `git ls-files --stage ${srcPath}` to check if `${srcPath}` already exists in the index.
 * - Run `git rm --cached ${srcPath}`;
 *
 * ! `A git directory for ${srcPath} is found locally with remote(s): origin	https://github.com/worldzhy/newbie.map.git`
 * How to handle it?
 * - Run `rm -rf .git/modules/${srcPath}`
 * - Run `git config --remove-section submodule.${srcPath}`
 *
 */

const addRepositories = addedMicroservices => {
  execSync(`touch ${GIT_MODULES}`);

  addedMicroservices.forEach(name => {
    const {key, srcPath, repositoryUrl} = ALL_MICROSERVICES[name] || {};
    const srcPathDotNewbiePath = `${srcPath}/.newbie`;

    if (!key) return;
    execSync(`rm -rf ${srcPath}`);

    // [step 1] Clone code repository
    try {
      execSync(`git submodule add ${repositoryUrl} ${srcPath}`);
    } catch (error) {}

    // [step 2] Copy settings file and schema file to .newbie/.enabled folder
    if (srcPathDotNewbiePath && fs.existsSync(srcPathDotNewbiePath)) {
      execSync(`cp -rf ${srcPathDotNewbiePath} ${ENABLED_PATH}/${key}`);
    }

    // [step 3] Remove useless files for newbie user.
    if (!isNewbieDeveloper) {
      execSync(`git rm -r --cached ${srcPath}`);

      // Remove submodule section in .git/config file
      execSync(`git config --remove-section submodule.${srcPath}`);

      // Delete .git/modules/[key]
      execSync(`rm -rf .git/modules/${srcPath}`);

      // Remove useless files for newbie user.
      execSync(`rm -rf ${srcPathDotNewbiePath}`);
    }
  });

  if (!isNewbieDeveloper) {
    execSync(`rm -f ${GIT_MODULES}`);
  }
};

const removeRepositories = removedMicroservices => {
  removedMicroservices.forEach(name => {
    const {key, srcPath} = ALL_MICROSERVICES[name] || {};

    if (!key) return;

    // [step 1] Delete ./newbie.enabled/[key]/
    const enabledMicroservicesPath = `${ENABLED_PATH}/${key}`;
    if (enabledMicroservicesPath && fs.existsSync(enabledMicroservicesPath)) {
      execSync(`rm -r ${enabledMicroservicesPath}`);
    }

    // [step 2] Remove git submodule link for newbie developer.
    if (isNewbieDeveloper) {
      try {
        // Delete source code and remove the submodule in the .gitmodules
        execSync(`git rm -rf ${srcPath}`);

        // Remove submodule section in .git/config file
        execSync(`git config --remove-section submodule.${srcPath}`);

        // Delete .git/modules/[key]
        execSync(`rm -rf .git/modules/${srcPath}`);
      } catch (error) {}
    } else {
      execSync(`rm -rf ${srcPath}`);
    }
  });
};

module.exports = {
  addRepositories,
  removeRepositories,
};
