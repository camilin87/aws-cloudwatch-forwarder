var async = require("async");
var promise = require("the-promise-factory");

module.exports = function (cloudWatchLogs) {
    var initConfig = {}
    var cachedSequenceToken = null

    return {
        init: config => {
            validateConfig(config)
            initConfig = standarizeConfig(config)

            logDebugMessage("Configuration: " + initConfig)

            return promise.create((fulfill, reject) => {
                if (!initConfig.aws.enabled){
                    fulfill()
                    return
                }

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
                if (!initConfig.aws.enabled){
                    fulfill()
                    return
                }
                
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

                if (readCachedSequenceToken()){
                    logData.sequenceToken = readCachedSequenceToken()
                }

                logDebugMessage("cloudWatchLogs.putLogEvents, length=" + logLines.length)
                cloudWatchLogs.putLogEvents(logData, (err, data) => {
                    if (err){
                        reject(err)
                        return
                    }

                    setCachedSequenceToken(data.nextSequenceToken)

                    fulfill()
                })
            })
        }
    }

    function readCachedSequenceToken(){
        logDebugMessage("readCachedSequenceToken, result= " + cachedSequenceToken)
        return cachedSequenceToken
    }

    function setCachedSequenceToken(value){
        logDebugMessage("setCachedSequenceToken, value= " + value)
        cachedSequenceToken = value
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

    function standarizeConfig(config){
        config = config || {}
        config.aws = config.aws || {}

        config.aws.debug = config.aws.debug || false

        if (config.aws.enabled === false){
            config.aws.enabled = false
        }
        else {
            config.aws.enabled = true
        }

        return config
    }

    function initInfo(callback){
        callback(null, {})
    }

    function logDebugMessage(message){
        if (initConfig.aws.debug){
            console.log(`[AWS_FORWARDER_DEBUG] ${message}`)
        }
    }

    function readExistingLogGroups(info, callback) {
        logDebugMessage("cloudWatchLogs.describeLogGroups")
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

        logDebugMessage("cloudWatchLogs.createLogGroup")
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
        logDebugMessage("cloudWatchLogs.describeLogStreams")
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

            setCachedSequenceToken(logStream.uploadSequenceToken)
        }

        callback(null, info)
    }

    function createLogStream(info, callback){
        if (info.logStreamAlreadyExists){
            callback(null, info)
            return
        }

        logDebugMessage("cloudWatchLogs.createLogStream")
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