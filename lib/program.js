var promise = require("the-promise-factory")

module.exports = (programInitializer) => {
    return {
        run: () => promise.create((fulfill, reject) => {
            var programInfo = programInitializer.init()

            programInfo.child.wait().then(exitCode => {

                if (exitCode !== 0){
                    fulfill(exitCode)
                }

                programInfo.forwarder.run(programInfo.config)
                    .then(() => {
                        fulfill(0)
                    }, err => {
                        fulfill(1)
                    })
            }, err => {
                fulfill(1)
            })
        })
    }
}