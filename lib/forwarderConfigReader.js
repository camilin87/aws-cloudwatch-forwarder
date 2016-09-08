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
                    logGroupName: "aws-log-forwarder",
                    logStreamName: logStreamNameCalculator(),
                    debug: false,
                    enabled: true
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