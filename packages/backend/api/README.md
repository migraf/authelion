# @authelion/api ♟

[![npm version](https://badge.fury.io/js/@authelion%2Fapi.svg)](https://badge.fury.io/js/@authelion%2Fapi)
[![main](https://github.com/Tada5hi/authelion/actions/workflows/main.yml/badge.svg)](https://github.com/Tada5hi/authelion/actions/workflows/main.yml)
[![codecov](https://codecov.io/gh/Tada5hi/authelion/branch/master/graph/badge.svg?token=FHE347R1NW)](https://codecov.io/gh/Tada5hi/authelion)
[![Known Vulnerabilities](https://snyk.io/test/github/Tada5hi/authelion/badge.svg)](https://snyk.io/test/github/Tada5hi/authelion)

This package contains a simple standalone api application.
Database migrations e.g. have to be created every time the version of this package is updated.

---
**Important NOTE**

The `README.md` is under construction ☂ at the moment. So please stay patient or contribute to it, till it covers all parts ⭐.

---

**Table of Contents**

- [Installation](#installation)
- [Usage](#usage)
  - [Config](#config)
  - [Setup](#setup)
  - [Start](#start)
  - [Upgrade](#upgrade)
  
## Installation

```sh
npm install @authelion/api --save
```

## Usage

### Config

In general no configuration file is required at all!
All options have either default values or are generated automatically 🔥.

To overwrite the default (generated) config property values, 
create a `authelion.config.js` file in the root directory with the following content:

```typescript
module.exports = {
    env: process.NODE_ENV, // development, production, test
    port: 3010,

    adminUsername: 'admin',
    adminPassword: 'start123',
    
    // robotSecret: '', // 
    
    root: process.cwd(),
    writableDirectory: 'writable',

    selfUrl: 'http://127.0.0.1:3010/',
    webUrl: 'http://127.0.0.1:3000/',

    tokenMaxAge: {
        accessToken: 3600, // 1 hour
        refreshToken: 36000 // 10 hours
    },
    
    swaggerDocumentation: true,
    
    redis: true,
}
```
Another way is e.g. to place an `.env` file in the root-directory or provide these properties
by the system environment.

```dotenv
PORT=3010

ADMIN_USERNAME=admin
ADMIN_PASSWORD=start123

ROBOT_SECRET=xxx
PERMISSIONS=data_add,data_edit,...

SELF_URL=http://127.0.0.1:3010/
WEB_URL=http://127.0.0.1:3000/

WRITABLE_DIRECTORY=writable

REFRESH_TOKEN_MAX_AGE=3600
ACCESS_TOKEN_MAX_AGE=3600

SWAGGER_DOCUMENTATION=true

REDIS=true
```

### Setup
If no option is specified, all options are by default `true` as long no
other option is explicit specified.
In the following shell snippet all options are manually set to `true`.
```shell
$ authelion setup \
  --keyPair=true \
  --database=true \
  --databaseSeeder=true \
  --documentation=true
```

The output should be similar, with other values for the `Robot ID` and `Robot Secret`:
```shell
✔ Generated rsa key-pair.
✔ Created database.
✔ Synchronized database schema.
✔ Seeded database.
ℹ Robot ID: 51dc4d96-f122-47a8-92f4-f0643dae9be5
ℹ Robot Secret: d1l33354crj1kyo58dbpflned2ocnw2yez69
```

### Start

To start the application, simply execute the command: 

```shell
$ authelion start
```

It will output the following information on startup:

```shell
ℹ Environment: development
ℹ WritableDirectory: writable
ℹ URL: http://127.0.0.1:3010/
ℹ Docs-URL: http://127.0.0.1:3010/docs
ℹ Web-URL: http://127.0.0.1:3000/
✔ Initialised controllers & middlewares.
✔ Established database connection.
✔ Built & started token aggregator.
✔ Startup completed.
```

#### Upgrade 

To upgrade the application (migrations, schemes, ...), run:

```shell
$ authelion upgrade
```