var promise = require("the-promise-factory")

module.exports = (inputRepository, forwarderServiceFactory, forwarderConfigReader, setTimeoutFn) => {
    if (!setTimeoutFn){
        setTimeoutFn = setTimeout;
    }

    var runConfig = {}

    return {
        run: (config) => {
            var transmissionAttempt = 0
            var forwarder = forwarderServiceFactory.create()
            var forwarderConfig = forwarderConfigReader.read()

            runConfig = config || {}
            runConfig.readInterval = runConfig.readInterval || 1000
            runConfig.maxCount = runConfig.maxCount || 10000
            runConfig.maxRetries = runConfig.maxRetries || 0

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
}