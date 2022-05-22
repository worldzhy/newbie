<p align="left">

![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)
![GitHub](https://img.shields.io/github/license/worldzhy/z?style=flat-square)
![GitHub package.json dependency version (prod)](https://img.shields.io/github/package-json/dependency-version/worldzhy/z/@nestjs/core?style=flat-square)
![GitHub package.json dependency version (prod)](https://img.shields.io/github/package-json/dependency-version/worldzhy/z/@prisma/client?style=flat-square)
![GitHub package.json dependency version (prod)](https://img.shields.io/github/package-json/dependency-version/worldzhy/z/@pulumi/pulumi?style=flat-square)
![GitHub package.json dependency version (prod)](https://img.shields.io/github/package-json/dependency-version/worldzhy/z/passport?style=flat-square)
![GitHub package.json dependency version (prod)](https://img.shields.io/github/package-json/dependency-version/worldzhy/z/validator?style=flat-square)

</p>

## Description

[Z](https://github.com/worldzhy/gc-basic) is a [Node.js](http://nodejs.org) project development framework based on [Nest](https://github.com/nestjs/nest), [Prisma](https://github.com/prisma/prisma), [Pulumi](https://github.com/pulumi/pulumi).

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo_text.svg" width="320" alt="Nest Logo" /></a>
</p>
  
![Prisma](https://i.imgur.com/h6UIYTu.png)

<p align="center">
  <a href="https://www.pulumi.com?utm_campaign=pulumi-pulumi-github-repo&utm_source=github.com&utm_medium=top-logo" title="Pulumi - Modern Infrastructure as Code - AWS Azure Kubernetes Containers Serverless"><img src="https://www.pulumi.com/images/logo/logo-on-white-box.svg?" width="350"></a>
</p>



## Installation

```bash
# development
$ npm install
$ cp .env.example .env

# production
$ npm install --production
$ cp .env.example .env
```

## Running the app

```bash
# development
$ npm run start:dev

# production
$ npm run build
$ npm run start:prod
```

## Google ts lint

```
$ npx gts init
```

## husky

```
$ npx husky install
```

## Prisma

```
$ npx prisma generate
$ npx prisma migrate dev
$ npx prisma db seed
$ npx prisma migrate deploy
```

## Test

```bash
# unit tests
$ npm test

# e2e tests
$ npm test:e2e

# test coverage
$ npm test:cov
```

## Lint

```bash
$ npm run lint 
```

## Stay in touch

- Author - [Henry Zhao](https://blog.csdn.net/worldzhy)
- Website - [https://blog.csdn.net/worldzhy](https://blog.csdn.net/worldzhy)

## License

Z is [MIT licensed](LICENSE).
