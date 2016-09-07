var async = require("async");
var promise = require("the-promise-factory");

module.exports = function (cloudWatchLogs) {
    return {
        init: (config) => {
            return promise.create((fulfill, reject) => {
                async.waterfall([
                    readInfo(config),
                    readExistingLogGroups,
                    targetGroupAlreadyExists,
                    createLogGroup
                ], (err, r) => {
                    if (err){
                        reject(err)
                        return
                    }

                    fulfill()
                })
            })
        } 
    }

    function readInfo(config){
        return callback => {
            callback(null, {config: config})
        }
    }

    function readExistingLogGroups(info, callback) {
        cloudWatchLogs.describeLogGroups({
            logGroupNamePrefix: info.config.aws.logGroupName
        }, (err, data) => {
            if (err) {
                callback(err)
                return
            }

            info.logGroups = data.logGroups || [];

            callback(null, info)
        })
    }

    function targetGroupAlreadyExists(info, callback) {
        var result = info.logGroups.find(g => g.logGroupName === info.config.aws.logGroupName)

        info.logGroupAlreadyExists = result;

        callback(null, info)
    }

    function createLogGroup(info, callback){
        if (info.logGroupAlreadyExists){
            callback(null, info)
            return
        }

        cloudWatchLogs.createLogGroup({
            logGroupName: info.config.aws.logGroupName
        }, (err, data) => {
            if (err){
                callback(err)
                return
            }

            callback(null, info)
        })
    }
}