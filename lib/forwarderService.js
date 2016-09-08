var promise = require("the-promise-factory")
var async = require("async")

module.exports = forwarders => {
    forwarders = forwarders || []

    return {
        init: config => executeOnEachForwarder(f => f.init(config)),
        send: logLines => {
            logLines = logLines || []
            validateLogLines(logLines)
            return executeOnEachForwarder(f => f.send(logLines))
        }
    }

    function validateLogLines(logLines){
        var allLinesContainMessages = logLines.every(l => l.message !== null && l.message !== undefined)

        if (!allLinesContainMessages){
            throw new Error("Invalid input. message field missing")
        }

        var allLinesContainTimestamps = logLines.every(l => l.timestamp !== null && l.timestamp !== undefined)

        if (!allLinesContainTimestamps){
            throw new Error("Invalid input. timestamp field missing")
        }
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