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

                    var groupAlreadyExists = (data.logGroups || [])
                        .find(g => g.logGroupName === config.aws.logGroupName);

                    if (!groupAlreadyExists){
                        cloudWatchLogs.createLogGroup({
                            logGroupName: config.aws.logGroupName
                        }, (err, data) => {
                            if (err){
                                reject(err);
                            }
                        });
                    }

                    fulfill()
                });
            })
        }
    }
}