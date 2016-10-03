# ghost-blade

A slightly opinionated convenience wrapper for the ghost blog system that lets you use ghost as an express middleware. While being similar to [ghost-on-heroku](https://github.com/cobyism/ghost-on-heroku) (thanks for the inspiration), it enables you to run ghost on any JS hosting platform.

# Installation
```
npm install ghost-blade
```

# API
`ghost-blade` exports a function that takes a `ghostConfig` object and returns a promise of an express middleware. The `ghostConfig` object is checked for secure production settings and then passed directly to `ghost`. See all config options at [Configuring ghost](http://support.ghost.org/config/).

Use the config file examples below as a starter. `ghost-blade` prohibits insecure settings or settings involving local file storage to enable you to run your blog on popular JS hosting services (e. g. Heroku, Bitnami).

# Usage example
```
// index.js
import express from 'express'
import ghostBlade from 'ghost-blade'
import logger from 'winston'

import config from './config.js'
import ghostConfig from './ghostConfig.js'

var app = express()

ghostBlade({ghostConfig})
    .then(function (ghostBladeMiddleware) {
        app.use('/', ghostBladeMiddleware)
        app.listen(config.server.port, config.server.host, function () {
            logger.info('listening on ' + config.server.host + ':' + config.server.port + ' in ' + process.env.NODE_ENV + ' mode')
        })
    })
    .catch(function (e) {
        logger.error(e)
    })
```
```
// config.js
const config = {
    development: {
        server: {
            host: 'localhost',
            port: 1336
        }
    },
    production: {
        url: 'http://yourapp.com',
        server: {
            host: '0.0.0.0',
            port: process.env.PORT || 1336
        }
    }
}

export default config[process.env.NODE_ENV]
```
```
// ghostConfig.js
export default {
    development: {
        url: 'http://localhost:1336',
        database: {
            client: 'mysql',
            connection: mysql://user:password@host/database
        }
    },
    production: {
        url: process.env.URL,
        database: {
            client: 'mysql',
            connection: mysql://user:password@host/database
        },
        fileStorage: false,
        forceAdminSSL: true
    }
}
```
