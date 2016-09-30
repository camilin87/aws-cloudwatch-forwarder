var promise = require("the-promise-factory")

module.exports = (processModule, programInitializer) => {
    return {
        run: () => promise.create((fulfill, reject) => {
            var programInfo = programInitializer.init()

            programInfo.child.wait().then(() => {

                programInfo.forwarder.run(programInfo.config)
                    .then(null, err => {
                        processModule.exit(1)

                        fulfill()
                    })
            }, err => {
                processModule.exit(1)

                fulfill()
            })
        })
    }
}