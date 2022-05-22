[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest


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
$ npx prisma generate
$ npx prisma migrate dev
$ npx prisma db seed
$ npx gts init

# production
$ npm install --production
$ npx prisma generate
$ npx prisma migrate deploy
```

## Running the app

```bash
# development
$ npm run start:dev

# production mode
$ npm run build
$ npm run start:prod
```

## Lint

```bash
$ npm run lint 
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

## Stay in touch

- Author - [Henry Zhao](https://blog.csdn.net/worldzhy)
- Website - [https://blog.csdn.net/worldzhy](https://blog.csdn.net/worldzhy)

## License

Z is [MIT licensed](LICENSE).
