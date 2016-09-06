var promise = require("the-promise-factory");

module.exports = function (cloudWatchLogs) {
    return {
        init: (config) => {
            return promise.create((fulfill, reject) => {
                cloudWatchLogs.describeLogGroups({
                    logGroupNamePrefix: config.aws.logGroupName
                }, (err, data) => {
                    if (err) {
                        reject(err)
                        return;
                    }

                    cloudWatchLogs.createLogGroup({
                        logGroupName: config.aws.logGroupName
                    }, (err, data) => {
                        
                    });

                    fulfill()
                });
            })
        }
    }
}