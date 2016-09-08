var rfr = require("rfr")
var logStreamNameCalculatorModule = rfr("lib/logStreamNameCalculator")

module.exports = (logStreamNameCalculator, env) => {
    if (!logStreamNameCalculator) {
        logStreamNameCalculator = logStreamNameCalculatorModule
    }

    if (!env){
        env = process.env
    }

    return {
        read: () => {
            return {
                aws: {
                    logGroupName: readEnvValue("FC_AWS_LOG_GROUP_NAME", "aws-log-forwarder"),
                    logStreamName: readEnvValue("FC_AWS_LOG_STREAM_NAME", logStreamNameCalculator()),
                    debug: readEnvValue("FC_AWS_DEBUG", false),
                    enabled: readEnvValue("FC_AWS_ENABLED", true)
                },
                stdout: {
                    enabled: readEnvValue("FC_STDOUT_ENABLED", true)
                }
            }
        }
    }

    function readEnvValue(key, defaultValue) {
        var envValue = env[key]

        if (envValue === null || envValue === undefined){
            return defaultValue
        }

        return envValue
    }
}