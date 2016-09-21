var lodash = require('lodash')
var path = require('path')
var ghost = require('ghost')

module.exports = function(options) {
    // check mandatory options
    if (!lodash.get(options, 'app')) {
        throw new Error('No app specified.')
    }
    if (!lodash.get(options, 'expressPath')) {
        throw new Error('No expressPath specified.')
    }
    if (!lodash.get(options, 'ghostConfig.database.connection')) {
        throw new Error('No ghostConfig.database.connection specified.')
    }

    // check disallowed options
    if (lodash.get(options, 'ghostConfig.fileStorage')) {
        throw new Error('You must not specify ghostConfig.fileStorage. The default is false.')
    }
    if (lodash.get(options, 'ghostConfig.database.client', 'mysql') != 'mysql') {
        throw new Error('You must not specify ghostConfig.database.client. The default is \'mysql\'.')
    }
    if (lodash.get(options, 'ghostConfig.paths.contentPath')) {
        throw new Error('You must not specify ghostConfig.paths.contentPath. The default is \'' + path.join(process.cwd(), '/content') + '\'.')
    }

    // set defaults for disallowed options
    lodash.defaultsDeep(options, {
        ghostConfig: {
            fileStorage: false,
            database: {
                client: 'mysql'
            },
            paths: {
                contentPath: path.join(process.cwd(), '/content')
            }
        }
    })

    return ghost().then(function (ghostServer) {
        lodash.merge(ghostServer.config, options.ghostConfig)
        options.app.use(options.expressPath, ghostServer.rootApp);
        return ghostServer.start(options.app);
    })
}
