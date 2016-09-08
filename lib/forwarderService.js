var promise = require("the-promise-factory")
var async = require("async")

module.exports = forwarders => {
    forwarders = forwarders || []

    return {
        init: config => executeOnEachForwarder(f => f.init(config)),
        send: logLines => executeOnEachForwarder(f => f.send(logLines))
    }

    function executeOnEachForwarder(action) {
        return promise.create((fulfill, reject) => {
            async.each(
                forwarders,
                (forwarder, callback) => {
                    action(forwarder).then(() => {
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