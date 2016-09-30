var promise = require("the-promise-factory")
var async = require("async")

module.exports = (programInitializer) => {
    return {
        run: () => promise.create((fulfill, reject) => {
            var programInfo = programInitializer.init()

            async.parallel([
                (callback) => {
                    programInfo.forwarder
                        .run(programInfo.config)
                        .then(
                            () => callback(null, 0),
                            err => callback(null, 1)
                        )
                },
                (callback) => {
                    programInfo.child.wait().then(
                        code => callback(null, code),
                        err => callback(null, 1)
                    )
                }
            ], (err, exitCodes) => {
                var exitCode = Math.max.apply(Math, exitCodes)
                fulfill(exitCode)
            })
        })
    }
}