var async = require("async");
var promise = require("the-promise-factory");

module.exports = function (cloudWatchLogs) {
    var initConfig = {}
    var sequenceToken = null

    return {
        init: config => {
            validateConfig(config)

            initConfig = config

            return promise.create((fulfill, reject) => {
                async.waterfall([
                    initInfo,
                    readExistingLogGroups,
                    targetGroupAlreadyExists,
                    createLogGroup,
                    readExistingLogStreams,
                    targetLogStreamAlreadyExists,
                    readExistingSequenceToken,
                    createLogStream
                ], (err, r) => {
                    if (err){
                        reject(err)
                        return
                    }

                    fulfill()
                })
            })
        },
        send: logLines => {
            return promise.create((fulfill, reject) => {
                logLines = logLines || [];
                if (logLines.length === 0){
                    fulfill()
                    return
                }

                var logData = {
                    logEvents: logLines,
                    logGroupName: initConfig.aws.logGroupName,
                    logStreamName: initConfig.aws.logStreamName
                }

                if (sequenceToken){
                    logData.sequenceToken = sequenceToken
                }

                cloudWatchLogs.putLogEvents(logData, (err, data) => {
                    if (err){
                        reject(err)
                        return
                    }

                    sequenceToken = data.nextSequenceToken

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

        config.aws.debug = config.aws.debug || false
    }

    function initInfo(callback){
        callback(null, {})
    }

    function readExistingLogGroups(info, callback) {
        cloudWatchLogs.describeLogGroups({
            logGroupNamePrefix: initConfig.aws.logGroupName
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
        var result = info.logGroups.find(g => g.logGroupName === initConfig.aws.logGroupName)

        info.logGroupAlreadyExists = result;

        callback(null, info)
    }

    function createLogGroup(info, callback){
        if (info.logGroupAlreadyExists){
            callback(null, info)
            return
        }

        cloudWatchLogs.createLogGroup({
            logGroupName: initConfig.aws.logGroupName
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
            logGroupName: initConfig.aws.logGroupName,
            logStreamNamePrefix: initConfig.aws.logStreamName
        }, (err, data) => {
            if (err){
                callback(err)
                return
            }

            info.logStreams = data.logStreams || []

            callback(null, info)
        })
    }

    function getLogStreamWithName(logStreams, name){
        return logStreams.find(s => s.logStreamName === name)
    }

    function targetLogStreamAlreadyExists(info, callback){
        info.logStreamAlreadyExists = getLogStreamWithName(
            info.logStreams,
            initConfig.aws.logStreamName
        )

        callback(null, info)
    }

    function readExistingSequenceToken(info, callback){
        if (info.logStreamAlreadyExists){
            var logStream = getLogStreamWithName(
                info.logStreams,
                initConfig.aws.logStreamName
            )

            sequenceToken = logStream.uploadSequenceToken
        }

        callback(null, info)
    }

    function createLogStream(info, callback){
        if (info.logStreamAlreadyExists){
            callback(null, info)
            return
        }

        cloudWatchLogs.createLogStream({
            logGroupName: initConfig.aws.logGroupName,
            logStreamName: initConfig.aws.logStreamName
        }, (err, data) => {
            if (err){
                callback(err)
                return
            }

            callback(null, info)
        })
    }
}