const fs = require('fs');
const {underline} = require('colorette');
const {getEnabledMicroservices} = require('../.db/microservices');
const {
  ALL_MICROSERVICES,
  TS_CONFIG_JSON,
  TS_CONFIG_BUILD_JSON,
} = require('../constants');

const assembleTsConfigFiles = () => {
  console.info('|' + underline(' 4. updating tsconfig... ') + '|');

  const enabledMicroservices = getEnabledMicroservices();
  let tsconfig = {exclude: []};
  let tsBuildConfig = {exclude: []};
  const tsCheckSrc = [];
  const tsExcludeSrc = [];

  if (!fs.existsSync(TS_CONFIG_JSON)) {
    console.error('Error: Missing tsconfig.json file!');
  } else {
    tsconfig = JSON.parse(fs.readFileSync(TS_CONFIG_JSON, 'utf8')) || {};
  }
  if (!fs.existsSync(TS_CONFIG_BUILD_JSON)) {
    console.error('[Error] Missing tsconfig.build.json file');
  } else {
    tsBuildConfig =
      JSON.parse(fs.readFileSync(TS_CONFIG_BUILD_JSON, 'utf8')) || {};
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
  fs.writeFileSync(TS_CONFIG_JSON, JSON.stringify(tsconfig, null, 2));
  fs.writeFileSync(
    TS_CONFIG_BUILD_JSON,
    JSON.stringify(tsBuildConfig, null, 2)
  );
};

module.exports = {
  assembleTsConfigFiles,
};
