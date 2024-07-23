const fs = require('fs');
const {getEnabledMicroservices} = require('../enabled');
const {
  ALL_MICROSERVICES,
  TS_CONFIG_PATH,
  TS_CONFIG_BUILD_PATH,
} = require('../constants');

const assembleTsConfigFiles = () => {
  const enabledMicroservices = getEnabledMicroservices();
  let tsconfig = {exclude: []};
  let tsBuildConfig = {exclude: []};
  const tsCheckSrc = [];
  const tsExcludeSrc = [];

  if (!fs.existsSync(TS_CONFIG_PATH)) {
    console.error('Error: Missing tsconfig.json file!');
  } else {
    tsconfig = JSON.parse(fs.readFileSync(TS_CONFIG_PATH, 'utf8')) || {};
  }
  if (!fs.existsSync(TS_CONFIG_BUILD_PATH)) {
    console.error('Error: Missing tsconfig.build.json file!');
  } else {
    tsBuildConfig =
      JSON.parse(fs.readFileSync(TS_CONFIG_BUILD_PATH, 'utf8')) || {};
  }

  const {exclude} = tsconfig;
  const {exclude: buildExclude} = tsBuildConfig;

  Object.values(ALL_MICROSERVICES).forEach(({key, srcPath}) => {
    if (enabledMicroservices.includes(key)) {
      tsCheckSrc.push(srcPath);
    } else {
      tsExcludeSrc.push(srcPath);
    }
  });
  if (exclude?.length) {
    tsconfig.exclude = Array.from(
      new Set(
        [...exclude, ...tsExcludeSrc].filter(path => !tsCheckSrc.includes(path))
      )
    );
  } else {
    tsconfig.exclude = tsExcludeSrc;
  }
  if (buildExclude?.length) {
    tsBuildConfig.exclude = Array.from(
      new Set(
        [...buildExclude, ...tsExcludeSrc].filter(
          path => !tsCheckSrc.includes(path)
        )
      )
    );
  } else {
    tsBuildConfig.exclude = tsExcludeSrc;
  }
  fs.writeFileSync(TS_CONFIG_PATH, JSON.stringify(tsconfig, null, 2));
  fs.writeFileSync(
    TS_CONFIG_BUILD_PATH,
    JSON.stringify(tsBuildConfig, null, 2)
  );
  console.info(`Update tsconfig.json and tsconfig.build.json`);
};

module.exports = {
  assembleTsConfigFiles,
};
