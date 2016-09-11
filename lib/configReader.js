module.exports = (env) => {
    if (!env){
        env = process.env
    }

    return {
        read: () => {
            var result = {}

            if (envContainsValue("FCG_POLLING_INTERVAL")){
                result.readInterval = readEnvIntValue("FCG_POLLING_INTERVAL")
            }

            if (envContainsValue("FCG_MAX_COUNT_PER_TRANSMISSION")){
                result.maxCount = readEnvIntValue("FCG_MAX_COUNT_PER_TRANSMISSION")
            }

            return result
        }
    }

    function envContainsValue(key) {
        return env.hasOwnProperty(key)
    }

    function readEnvIntValue(key) {
        return parseInt((env[key] || "").toString())
    }
}