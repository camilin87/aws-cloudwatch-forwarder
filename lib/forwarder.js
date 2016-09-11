var promise = require("the-promise-factory")

module.exports = (inputRepository, forwarderServiceFactory, forwarderConfigReader, setTimeoutFn) => {
    if (!setTimeoutFn){
        setTimeoutFn = setTimeout
    }

    return {
        run: (config) => {
            var transmissionAttempt = 0
            var forwarder = forwarderServiceFactory.create()
            var forwarderConfig = forwarderConfigReader.read()
            var runConfig = readConfiguration(config)

            logDebugMessage("ForwarderConfiguration:", runConfig)

            return wrapRunInternal()

            function wrapRunInternal(){
                return promise.create((fulfill, reject) => {
                    runInternal().then(() => {
                        logDebugMessage("FF_COMPLETED")
                        fulfill()
                    }, err => {
                        logDebugMessage(err, err.stack)
                        reject(err)
                    })
                })
            }

            function runInternal(){
                return promise.create((fulfill, reject) => {
                    transmitData().then(fulfill, err => {
                        if (transmissionAttempt >= runConfig.maxRetries){
                            reject(err)
                            return
                        }

                        logDebugMessage("WARN", err, err.stack)
                        setTimeoutFn(() => {
                            runInternal().then(fulfill, reject)
                        }, getRetryDelay())
                    })
                })
            }

            function transmitData(){
                return promise.create((fulfill, reject) => {
                    transmissionAttempt++
                    forwarder
                        .init(forwarderConfig)
                        .then(() => {
                            sendLogs().then(fulfill, reject)
                        }, reject)
                })
            }

            function sendLogs(){
                return promise.create((fulfill, reject) => {
                    if (inputRepository.isInputClosed()){
                        fulfill()
                        return
                    }

                    sendAvailableLogLines()
                        .then(() => {
                            sendLogs().then(fulfill, reject)
                        }, reject)
                })
            }

            function sendAvailableLogLines(){
                return promise.create((fulfill, reject) => {
                    var lines = inputRepository.getLines()

                    if (lines.length === 0){
                        logDebugMessage(".".repeat(30))
                        setTimeoutFn(() => {
                            fulfill()
                        }, runConfig.readInterval)
                        return
                    }

                    var linesToSend = []

                    if (lines.length < runConfig.maxCount){
                        linesToSend = lines
                        inputRepository.setLines([])
                    }
                    else {
                        linesToSend = lines.slice(0, runConfig.maxCount)
                        inputRepository.setLines(lines.slice(runConfig.maxCount))
                    }

                    forwarder
                        .send(linesToSend)
                        .then(fulfill, reject)
                })
            }

            function getRetryDelay(){
                return Math.pow(runConfig.retryDelayBase, transmissionAttempt)
            }

            function logDebugMessage(message){
                if (runConfig.debug){
                    var updatedArguments = [
                        `[FORWARDER_DEBUG] ${message}`
                    ].concat(
                        Array.from(arguments).slice(1)
                    )

                    console.log.apply(console, updatedArguments)
                }
            }
        }
    }

    function readConfiguration(config){
        var result = config || {}
        result.readInterval = result.readInterval || 1000
        result.maxCount = result.maxCount || 10000
        result.maxRetries = result.maxRetries || 0
        result.retryDelayBase = result.retryDelayBase || 100

        if (result.debug === true){
            result.debug = true
        }else{
            result.debug = false
        }

        return result
    }
}