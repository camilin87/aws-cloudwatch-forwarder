var promise = require("the-promise-factory")

module.exports = (inputRepository, forwarderServiceFactory, forwarderConfigReader, setTimeoutFn) => {
    if (!setTimeoutFn){
        setTimeoutFn = setTimeout;
    }

    return {
        run: (config) => {
            var transmissionAttempt = 0
            var forwarder = forwarderServiceFactory.create()
            var forwarderConfig = forwarderConfigReader.read()
            var runConfig = readConfiguration(config)

            return runInternal()

            function runInternal(){
                return promise.create((fulfill, reject) => {
                    transmitData().then(fulfill, err => {
                        if (transmissionAttempt >= runConfig.maxRetries){
                            reject(err)
                            return
                        }

                        console.log("WARN", err, err.stack)
                        runInternal().then(fulfill, reject)
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
                            sendLogs().then(fulfill, reject);
                        }, reject)
                })
            }

            function sendAvailableLogLines(){
                return promise.create((fulfill, reject) => {
                    var lines = inputRepository.getLines()

                    if (lines.length === 0){
                        console.log(".".repeat(30));
                        setTimeoutFn(() => {
                            fulfill();
                        }, runConfig.readInterval);
                        return
                    }

                    var linesToSend = [];

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
        }
    }

    function readConfiguration(config){
        var result = config || {}
        result.readInterval = result.readInterval || 1000
        result.maxCount = result.maxCount || 10000
        result.maxRetries = result.maxRetries || 0
        return result
    }
}