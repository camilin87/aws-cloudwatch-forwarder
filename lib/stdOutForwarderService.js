var promise = require("the-promise-factory");

module.exports = () => {
    var initConfig = {
        disabled: false
    }

    return {
        init: config => promise.create((fulfill, reject) => {
            config = config || {}
            config.stdOut = config.stdOut || {}
            if (config.stdOut.disabled === true){
                initConfig.disabled = true
            }

            fulfill()
        }),
        send: loglines => promise.create((fulfill, reject) => {
            if (!initConfig.disabled){
                loglines
                    .map(l => l.message)
                    .forEach(l => console.log(l))
            }

            fulfill()
        })
    }
}