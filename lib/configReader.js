module.exports = (env) => {
    if (!env){
        env = process.env
    }

    return {
        read: () => {
            var result = {}

            setEnvValue(result, "readInterval", "FCG_POLLING_INTERVAL", readInt)
            setEnvValue(result, "maxCount", "FCG_MAX_COUNT_PER_TRANSMISSION", readInt)
            setEnvValue(result, "maxRetries", "FCG_RETRY_COUNT", readInt)
            setEnvValue(result, "retryDelayBase", "FCG_RETRY_DELAY_BASE_INTERVAL", readInt)
            setEnvValue(result, "debug", "FCG_DEBUG", readBool)

            return result
        }
    }

    function setEnvValue(target, propertyName, envKey, readValueFn){
        if (envContainsValue(envKey)){
            target[propertyName] = readValueFn(envKey)
        }
    }

    function envContainsValue(key) {
        return env.hasOwnProperty(key)
    }

    function readInt(key) {
        return parseInt((env[key] || "").toString())
    }

    function readBool(key) {
        if ((env[key] || "").toString().toLowerCase() === "true"){
            return true
        }

        return false
    }
}