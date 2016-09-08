var promise = require("the-promise-factory");

module.exports = () => {
    var initConfig = {
        enabled: true
    }

    return {
        init: config => promise.create((fulfill, reject) => {
            config = config || {}
            config.stdOut = config.stdOut || {}
            if (config.stdOut.enabled === false){
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