<p align="left">

![GitHub License](https://img.shields.io/github/license/worldzhy/newbie)
![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)
![GitHub package.json dependency version (prod)](https://img.shields.io/github/package-json/dependency-version/worldzhy/newbie/@nestjs/core?style=flat-square)
![GitHub package.json dependency version (prod)](https://img.shields.io/github/package-json/dependency-version/worldzhy/newbie/@prisma/client?style=flat-square)

</p>

## Description

[Newbie](https://github.com/worldzhy/newbie) is a [Node.js](http://nodejs.org) project development framework based on [NestJS](https://github.com/nestjs/nest).

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo_text.svg" width="320" alt="Nest Logo" /></a>
</p>

## Setup environment

#### Install Node.js

| Follow the guide https://blog.csdn.net/worldzhy/article/details/105092560

| Do not update these node packages:

- "@elastic/elasticsearch": "^7.13.0"
- "cache-manager": "^4.1.0"
- "cache-manager-redis-store": "^2.0.0"

#### Install pm2

```
npm i -g pm2
```

> https://pm2.io/

#### Install NestJS

```
npm i -g @nestjs/cli
```

> https://docs.nestjs.com/first-steps

## For development

### Install dependencies

```
$ npm i
$ cp .env.example .env
```

### Install database

```
$ npx prisma generate
$ npx prisma db push
$ npx prisma db seed
```

### Install google typescript lint

```
$ npx gts init
```

### Install husky

```
$ npm install --save-dev husky commitizen @commitlint/{cli,config-conventional}
$ npx husky init
$ npx commitizen init cz-conventional-changelog --save-dev --save-exact
$ echo "module.exports = {extends: ['@commitlint/config-conventional']};" > commitlint.config.js
```

### Start application

```
$ npm run dev
```

## For production

### Install dependencies

```
$ npm install --omit=dev
$ npm install --save-dev tsconfig-paths
$ cp .env.example .env
```

### Install database

```
$ npx prisma generate
$ npx prisma db push
$ npx prisma db seed
```

### Start application

```
$ npm run build
$ pm2 start npm --name newbie -- start
```

### Restart application

```
$ pm2 stop newbie
$ npm run build
$ pm2 start newbie
```

## License

Newbie is [MIT licensed](LICENSE).
