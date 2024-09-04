const fs = require('fs/promises');
const {exists} = require('../utilities/exists.util');
const {ALL_MICROSERVICES} = require('../constants/microservices.constants');
const {ENABLED_PATH, NEST_CLI_PATH} = require('../constants/path.constants');

const assembleNestJsAssets = async (
  addedMicroservices,
  removedMicroservices
) => {
  const isExists = await exists(NEST_CLI_PATH);

  if (!isExists) {
    console.error(`[Error] Missing nest.cli.json`);
    return;
  }
  const file = await fs.readFile(NEST_CLI_PATH, {
    encoding: 'utf8',
    flag: 'r',
  });
  const nestCli = JSON.parse(file);

  if (!nestCli?.compilerOptions) {
    nestCli.compilerOptions = {};
  }
  if (!nestCli?.compilerOptions?.assets) {
    nestCli.compilerOptions.assets = [];
  }
  for (let i = 0; i < addedMicroservices.length; i++) {
    const name = addedMicroservices[i];
    const {key, settingsFileName} = ALL_MICROSERVICES[name] || {};

    if (!key) {
      continue;
    }
    if (settingsFileName) {
      const settingsFilePath = `${ENABLED_PATH}/${key}/${settingsFileName}`;
      const isExists = await exists(settingsFilePath);

      if (isExists) {
        const file = await fs.readFile(settingsFilePath, {
          encoding: 'utf8',
          flag: 'r',
        });
        const {assets = []} = JSON.parse(file);

        if (assets.length) {
          const nestAssets = nestCli.compilerOptions.assets;

          nestCli.compilerOptions.assets = [...nestAssets, ...assets];
        }
      }
    }
  }
  for (let i = 0; i < removedMicroservices.length; i++) {
    const name = removedMicroservices[i];
    const {key, settingsFileName} = ALL_MICROSERVICES[name] || {};

    if (!key) {
      continue;
    }
    if (settingsFileName) {
      const settingsFilePath = `${ENABLED_PATH}/${key}/${settingsFileName}`;
      const isExists = await exists(settingsFilePath);

      if (isExists) {
        const file = await fs.readFile(settingsFilePath, {
          encoding: 'utf8',
          flag: 'r',
        });
        const {assets = []} = JSON.parse(file);

        if (assets.length) {
          const nestAssets = nestCli.compilerOptions.assets;

          nestCli.compilerOptions.assets = nestAssets.filter(
            asset => !assets.includes(asset)
          );
        }
      }
    }
  }
  nestCli.compilerOptions.assets = Array.from(
    new Set(nestCli.compilerOptions.assets)
  ).filter(assets => assets);
  await fs.writeFile(NEST_CLI_PATH, JSON.stringify(nestCli, null, 2));
};

module.exports = {
  assembleNestJsAssets,
};
