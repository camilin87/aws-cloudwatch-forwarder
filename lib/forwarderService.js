var promise = require("the-promise-factory")
var async = require("async")

module.exports = forwarders => {
    forwarders = forwarders || []

    return {
        init: config => promise.create((fulfill, reject) => {
            async.each(
                forwarders,
                (forwarder, callback) => {
                    forwarder
                        .init(config)
                        .then(() => {
                            callback(null)
                        }, callback)
                }, (err) => {
                    if (err) {
                        reject(err)
                        return
                    }

                    fulfill()
                })
        })
    }
}