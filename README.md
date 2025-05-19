<p align="left">

![GitHub License](https://img.shields.io/github/license/worldzhy/newbie)
![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)
![GitHub package.json dependency version (prod)](https://img.shields.io/github/package-json/dependency-version/worldzhy/newbie/@nestjs/core?style=flat-square)
![GitHub package.json dependency version (prod)](https://img.shields.io/github/package-json/dependency-version/worldzhy/newbie/@prisma/client?style=flat-square)

</p>

## 📖 Description

[Newbie](https://github.com/worldzhy/newbie) is a [Node.js](http://nodejs.org) project development framework based on [NestJS](https://github.com/nestjs/nest).

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo_text.svg" width="320" alt="Nest Logo" /></a>
</p>

## 🛠 Setup environment

#### Install Node.js

| Follow the guide https://blog.csdn.net/worldzhy/article/details/105092560

| Do not update these node packages:

- "@elastic/elasticsearch": "^7.13.0"
- "cache-manager": "^4.1.0"
- "cache-manager-redis-store": "^2.0.0"

#### Install pm2

```bash
npm i -g pm2
```

> https://pm2.io/

#### Install NestJS

```bash
npm i -g @nestjs/cli
```

> https://docs.nestjs.com/first-steps

## 👩‍💻 Develop

### Install dependencies

```bash
$ npm i
$ cp .env.example .env
```

### Install database

```bash
$ npx prisma generate
$ npx prisma db push
$ npx prisma db seed
```

### Install husky

```bash
$ npx husky install
```

```bash
// [Deprecated] Below is for the old version husky.
$ npm i --save-dev husky commitizen @commitlint/{cli,config-conventional}
$ npx husky init
$ npx commitizen init cz-conventional-changelog --save-dev --save-exact
$ echo "module.exports = {extends: ['@commitlint/config-conventional']};" > commitlint.config.js
```

### Set version

```bash
$npm version major
$npm version minor
$npm version patch
```

### Start application

```bash
$ npm run dev
```

## 💻 Production

### Install dependencies

```bash
$ npm i --omit=dev
$ npm i --save-dev tsconfig-paths
$ cp .env.example .env
```

### Install database

```bash
$ npx prisma generate
$ npx prisma db push
$ npx prisma db seed
```

### Start application

```bash
$ npm run build
$ pm2 start npm --name newbie -- start
```

### Restart application

```bash
$ pm2 stop newbie
$ npm run build
$ pm2 start newbie
```

### Proxy for geolite2-redist

```bash
npm i proxy-agent
```

> edit: node_modules/geolite2-redist/dist/download-helpers.js
> import {ProxyAgent} from 'proxy-agent';

got() set proxyAgent

```
await import('got')
  .then(({ got }) => got(mirrorUrls.checksum[dbName],{
      agent: {
          https: new ProxyAgent('http://127.0.0.1:54960') // local vpn port
      }
  }).text())
  .then(checksum => checksum.trim())
```

```
await pipeline(got.stream(mirrorUrls.download[dbName], {
    agent: {
        https: new ProxyAgent('http://127.0.0.1:54960') // local vpn port
    }
}), tar.x({
    cwd: hotDownloadDir,
    filter: (entryPath) => path.basename(entryPath) === `${dbName}.mmdb`,
    strip: 1
}));
```

## 📄 License

Newbie is [MIT licensed](LICENSE).
