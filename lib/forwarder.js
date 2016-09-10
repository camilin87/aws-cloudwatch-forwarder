var promise = require("the-promise-factory")

module.exports = (inputRepository, forwarderServiceFactory, forwarderConfigReader) => {
    return {
        run: () => {
            var forwarder = forwarderServiceFactory.create()
            var forwarderConfig = forwarderConfigReader.read()

            return promise.create((fulfill, reject) => {
                forwarder
                    .init(forwarderConfig)
                    .then(() => {
                        fulfill()
                    }, null)
            })
        }
    }
}