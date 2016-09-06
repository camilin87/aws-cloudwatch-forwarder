var promise = require("the-promise-factory");

module.exports = function (cloudWatchLogs) {
    return {
        init: (config) => {
            return promise.create((fulfill, reject) => {
                cloudWatchLogs.describeLogGroups({
                    logGroupNamePrefix: config.aws.logGroupName
                })

                fulfill()
            })
        }
    }
}