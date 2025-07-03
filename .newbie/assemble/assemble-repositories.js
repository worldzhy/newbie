const fs = require('fs/promises');
const {exec} = require('../utilities/exec.util');
const {exists} = require('../utilities/exists.util');
const {isNewbieDeveloper} = require('../utilities/env.util');
const {CONFIG_PATH, GIT_MODULES} = require('../constants/path.constants');
const {ALL_MICROSERVICES} = require('../constants/microservices.constants');

/**
 * ! Related files:
 *
 * .gitmodules file
 * .git/config file
 * .git/modules/... folder
 *
 */

/**
 * exec(`git submodule add ${repositoryUrl} ${srcPath}`)
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

const addRepositories = async addedMicroservices => {
  const isNewbieDev = await isNewbieDeveloper();
  const existsGitModulesFile = await exists(GIT_MODULES);

  if (!existsGitModulesFile) {
    await fs.writeFile(GIT_MODULES, '');
  }

  for (let i = 0; i < addedMicroservices.length; i++) {
    const name = addedMicroservices[i];
    const {key, srcPath, repositoryUrl} = ALL_MICROSERVICES[name] || {};
    const srcPathDotNewbiePath = `${srcPath}/.newbie`;

    if (!key) continue;
    const existsSrcPath = await exists(srcPath);
    if (existsSrcPath) {
      await exec(`rm -rf ${srcPath}`);
    }

    // [step 1] Clone code repository
    try {
      await exec(`git submodule add  --force ${repositoryUrl} ${srcPath}`);
    } catch (error) {
      console.error(error);
    }

    // [step 2] Copy settings file and schema file to .newbie/.config folder
    const existsDotNewbiePath = await exists(srcPathDotNewbiePath);
    if (srcPathDotNewbiePath && existsDotNewbiePath) {
      await exec(`cp -rf ${srcPathDotNewbiePath} ${CONFIG_PATH}/${key}`);
    }

    // [step 3] Remove useless files for newbie user.
    if (!isNewbieDev) {
      await exec(`git rm -r --cached ${srcPath}`);

      // Remove submodule section in .git/config file
      await exec(`git config --remove-section submodule.${srcPath}`);

      // Delete .git/modules/[key]
      await exec(`rm -rf .git/modules/${srcPath}`);

      // Remove useless files for newbie user.
      await exec(`rm -rf ${srcPathDotNewbiePath}`);
    }
  }

  if (!isNewbieDev) {
    await exec(`rm -f ${GIT_MODULES}`);
  }
};

const removeRepositories = async removedMicroservices => {
  const isNewbieDev = await isNewbieDeveloper();

  for (let i = 0; i < removedMicroservices.length; i++) {
    const name = removedMicroservices[i];
    const {key, srcPath} = ALL_MICROSERVICES[name] || {};

    if (!key) continue;

    // [step 1] Delete ./newbie.enabled/[key]/
    const enabledMicroservicesPath = `${CONFIG_PATH}/${key}`;
    const isExists = await exists(enabledMicroservicesPath);

    if (enabledMicroservicesPath && isExists) {
      await exec(`rm -r ${enabledMicroservicesPath}`);
    }

    // [step 2] Remove git submodule link for newbie developer.
    if (isNewbieDev) {
      try {
        // Delete source code and remove the submodule in the .gitmodules
        await exec(`git rm -rf ${srcPath}`);

        // Remove submodule section in .git/config file
        await exec(`git config --remove-section submodule.${srcPath}`);

        // Delete .git/modules/[key]
        await exec(`rm -rf .git/modules/${srcPath}`);
      } catch (error) {}
    } else {
      await exec(`rm -rf ${srcPath}`);
    }
  }
};

module.exports = {
  addRepositories,
  removeRepositories,
};
