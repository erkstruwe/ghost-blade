var lodash = require('lodash')
var path = require('path')
var jsonfile = require('jsonfile')
var ghost = require('ghost')

module.exports = function (options) {
    return new Promise(function (resolve, reject) {
        var ghostConfig = lodash.get(options, 'ghostConfig.' + process.env.NODE_ENV)

        // check mandatory options
        if (!ghostConfig) {
            return reject('No ghostConfig for environment \'' + process.env.NODE_ENV + '\'.')
        }

        // check disallowed options
        if (lodash.get(ghostConfig, 'server')) {
            return reject('You must not specify server when using ghostBlade middleware. Use app.listen(port, host) instead.')
        }
        if (lodash.get(ghostConfig, 'paths.contentPath')) {
            return reject('You must not specify ghostConfig.' + process.env.NODE_ENV + '.paths.contentPath. The default is \'' + path.join(process.cwd(), '/content') + '\'.')
        }
        if (process.env.NODE_ENV == 'production') {
            if (lodash.get(ghostConfig, 'fileStorage') !== false) {
                return reject('You must not use fileStorage in a production environment. Please set to false.')
            }
            if (lodash.get(ghostConfig, 'database.client') != 'mysql' && lodash.get(ghostConfig, 'database.client') != 'pg') {
                return reject('You must not use sqlite3 as database.client in a production environment. Please set to \'mysql\' (recommended) or \'pg\'.')
            }
            if (lodash.get(ghostConfig, 'forceAdminSSL', false) !== true) {
                return reject('You must forceAdminSSL in a production environment. Please set to true.')
            }
        }

        // set defaults for disallowed options
        lodash.defaultsDeep(ghostConfig, {
            server: {
                host: 'localhost',
                port: 1
            },
            database: {
                client: 'sqlite3',
                connection: {
                    filename: path.join(process.cwd(), '/content/data/ghost-dev.db')
                }
            },
            paths: {
                contentPath: path.join(process.cwd(), '/content')
            }
        })

        var ghostConfigFile = path.join(__dirname, 'config.json')
        jsonfile.writeFileSync(ghostConfigFile, options.ghostConfig)

        return ghost({config: ghostConfigFile})
            .then(function (ghostServer) {
                return resolve(ghostServer.rootApp)
            })
            .catch(function (e) {
                return reject(e)
            })
    })
}
