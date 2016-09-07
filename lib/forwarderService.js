var async = require("async");
var promise = require("the-promise-factory");

module.exports = function (cloudWatchLogs) {
    return {
        init: (config) => {
            validateConfig(config)

            return promise.create((fulfill, reject) => {
                async.waterfall([
                    readInfo(config),
                    readExistingLogGroups,
                    targetGroupAlreadyExists,
                    createLogGroup,
                    readExistingLogStreams,
                    targetLogStreamAlreadyExists,
                    createLogStream
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

    function validateConfig(config){
        var awsConfig = ((config || {}).aws || {});
        if((awsConfig.logGroupName || "").length === 0){
            throw new Error("a logGroupName is required")
        }

        if((awsConfig.logStreamName || "").length === 0){
            throw new Error("a logStreamName is required")
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

    function readExistingLogStreams(info, callback){
        cloudWatchLogs.describeLogStreams({
            logGroupName: info.config.aws.logGroupName,
            logStreamNamePrefix: info.config.aws.logStreamName
        }, (err, data) => {
            if (err){
                callback(err)
                return
            }

            info.logStreams = data.logStreams || []

            callback(null, info)
        })
    }

    function targetLogStreamAlreadyExists(info, callback){
        var result = info.logStreams.find(s => s.logStreamName === info.config.aws.logStreamName)

        info.logStreamAlreadyExists = result

        callback(null, info)
    }

    function createLogStream(info, callback){
        if (info.logStreamAlreadyExists){
            callback(null, info)
            return
        }

        cloudWatchLogs.createLogStream({
            logGroupName: info.config.aws.logGroupName,
            logStreamName: info.config.aws.logStreamName
        }, (err, data) => {
            if (err){
                callback(err)
                return
            }

            callback(null, info)
        })
    }
}