var lodash = require('lodash')
var path = require('path')
var jsonfile = require('jsonfile')
var ghost = require('ghost')

module.exports = function (options) {
    // check mandatory options
    if (!lodash.get(options, 'app')) {
        throw new Error('No app specified.')
    }
    if (!lodash.get(options, 'expressPath')) {
        throw new Error('No expressPath specified.')
    }
    if (!lodash.get(options, 'ghostConfig.' + process.env.NODE_ENV + '.database.connection')) {
        throw new Error('No ghostConfig.[environment].database.connection specified.')
    }

    // check disallowed options
    if (lodash.get(options, 'ghostConfig.' + process.env.NODE_ENV + '.fileStorage')) {
        throw new Error('You must not specify ghostConfig.[environment].fileStorage. The default is false.')
    }
    if (lodash.get(options, 'ghostConfig.' + process.env.NODE_ENV + '.database.client', 'mysql') !== 'mysql') {
        throw new Error('You must not specify ghostConfig.[environment].database.client. The default is \'mysql\'.')
    }
    if (lodash.get(options, 'ghostConfig.' + process.env.NODE_ENV + '.paths.contentPath')) {
        throw new Error('You must not specify ghostConfig.[environment].paths.contentPath. The default is \'' + path.join(process.cwd(), '/content') + '\'.')
    }
    if (lodash.get(options, 'ghostConfig.' + process.env.NODE_ENV + '.forceAdminSSL', true) !== true) {
        throw new Error('You must not specify ghostConfig.[environment].forceAdminSSL. The default is true.')
    }

    // set defaults for disallowed options
    lodash.defaultsDeep(lodash.get(options, 'ghostConfig.' + process.env.NODE_ENV, {}), {
        fileStorage: false,
        database: {
            client: 'mysql'
        },
        paths: {
            contentPath: path.join(process.cwd(), '/content')
        },
        forceAdminSSL: true
    })

    var ghostConfigFile = path.join(__dirname, 'config.json')
    jsonfile.writeFileSync(ghostConfigFile, options.ghostConfig)

    return ghost({config: ghostConfigFile}).then(function (ghostServer) {
        options.app.use(options.expressPath, ghostServer.rootApp);
        return ghostServer.start(options.app);
    })
}
