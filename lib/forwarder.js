var promise = require("the-promise-factory")

module.exports = (inputRepository, forwarderServiceFactory, forwarderConfigReader, setTimeoutFn) => {
    if (!setTimeoutFn){
        setTimeoutFn = setTimeout;
    }

    var runConfig = {}

    return {
        run: (config) => {
            var forwarder = forwarderServiceFactory.create()
            var forwarderConfig = forwarderConfigReader.read()

            runConfig = config || {}
            runConfig.readInterval = runConfig.readInterval || 1000

            return promise.create((fulfill, reject) => {
                forwarder
                    .init(forwarderConfig)
                    .then(() => {
                        sendLogs().then(fulfill, reject)
                    }, reject)
            })

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
                        console.log("X".repeat(30));
                        setTimeoutFn(() => {
                            fulfill();
                        }, runConfig.readInterval);
                        return
                    }

                    var linesToSend = [];

                    // if (lines.length < 5000){
                        linesToSend = lines
                        inputRepository.setLines([])
                    // }
                    // else {
                    //     linesToSend = lines.slice(0, 5000);
                    //     inputRepository.setLines(lines.slice(5000));
                    // }

                    forwarder
                        .send(linesToSend)
                        .then(fulfill, reject)
                })
            }


        }
    }
}