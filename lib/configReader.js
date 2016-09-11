module.exports = (env) => {
    if (!env){
        env = process.env
    }

    return {
        read: () => {
            var result = {}

            setValue(result, "readInterval", "FCG_POLLING_INTERVAL")
            setValue(result, "maxCount", "FCG_MAX_COUNT_PER_TRANSMISSION")

            return result
        }
    }

    function setValue(target, propertyName, envKey){
        if (envContainsValue(envKey)){
            target[propertyName] = readEnvIntValue(envKey)
        }
    }

    function envContainsValue(key) {
        return env.hasOwnProperty(key)
    }

    function readEnvIntValue(key) {
        return parseInt((env[key] || "").toString())
    }
}