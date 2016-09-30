var rfr = require("rfr")
var forwarderModule = rfr("lib/forwarder")
var forwarderServiceFactoryModule = rfr("lib/forwarderServiceFactory")
var forwarderConfigReaderModule = rfr("lib/forwarderConfigReader")

module.exports = (forwarderFn, forwarderServiceFactoryFn, forwarderConfigReaderFn) => {
    if (!forwarderFn){
        forwarderFn = forwarderModule
    }

    if (!forwarderServiceFactoryFn){
        forwarderServiceFactoryFn = forwarderServiceFactoryModule
    }

    if (!forwarderConfigReaderFn){
        forwarderConfigReaderFn = forwarderConfigReaderModule
    }

    return {
        create: inputRepository => {
            return forwarderFn(
                inputRepository,
                forwarderServiceFactoryFn(),
                forwarderConfigReaderFn()
            )
        }
    }
}