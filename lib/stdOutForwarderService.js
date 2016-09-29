var promise = require("the-promise-factory");

module.exports = () => {
    var initConfig = {
        enabled: true
    }

    return {
        init: config => promise.create((fulfill, reject) => {
            config = config || {}
            config.stdout = config.stdout || {}
            if (config.stdout.enabled === false){
                initConfig.enabled = false
            }

            fulfill()
        }),
        send: loglines => promise.create((fulfill, reject) => {
            if (initConfig.enabled){
                loglines
                    .map(l => l.message)
                    .forEach(l => console.log(l))
            }

            fulfill()
        })
    }
}