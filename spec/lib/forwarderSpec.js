var rfr = require("rfr")
var promise = require("the-promise-factory")
var forwarderFn = rfr("lib/forwarder")

describe("forwarder", () => {
    var forwarder = null

    var seededForwarderConfig = {name: "the forwarder config"}
    var inputRepositoryStub = null
    var forwarderServiceStub = null

    beforeEach(() => {
        inputRepositoryStub = {
            isInputClosed: () => {},
            getLines: () => {},
            setLines: () => {}
        }

        forwarderServiceStub = {
            init: () => {},
            send: () => {}
        }

        var forwarderServiceFactoryStub = {
            create: () => forwarderServiceStub
        }

        var forwarderConfigReaderStub = {
            read: () => seededForwarderConfig
        }

        forwarder = forwarderFn(
            inputRepositoryStub,
            forwarderServiceFactoryStub,
            forwarderConfigReaderStub
        )
    })

    it ("inits the forwarder service", done => {
        spyOn(forwarderServiceStub, "init").and.callFake(() => promise.create((fulfill, reject) => {
            fulfill()
        }))

        forwarder.run().then(() => {
            expect(forwarderServiceStub.init).toHaveBeenCalledWith(seededForwarderConfig)
            done()
        })
    })
})
