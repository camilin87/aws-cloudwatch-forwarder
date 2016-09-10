var rfr = require("rfr")
var promise = require("the-promise-factory")
var forwarderFn = rfr("lib/forwarder")

describe("forwarder", () => {
    var forwarder = null

    var seededForwarderConfig = {name: "the forwarder config"}
    var inputRepositoryStub = null
    var forwarderServiceStub = null
    var setTimeoutStub = null

    var isInputClosed = null

    beforeEach(() => {
        inputRepositoryStub = {
            isInputClosed: () => isInputClosed,
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

        setTimeoutStub = jasmine.createSpy("setTimeoutStub").and.callFake((callback, ms) => {
            callback()
        })

        forwarder = forwarderFn(
            inputRepositoryStub,
            forwarderServiceFactoryStub,
            forwarderConfigReaderStub,
            setTimeoutStub
        )
    })

    function initWillSucceed(){
        spyOn(forwarderServiceStub, "init").and.callFake(() => promise.create((fulfill, reject) => {
            fulfill()
        }))
    }

    function getLinesWillReturn(seededLines){
        spyOn(inputRepositoryStub, "getLines").and.returnValue(seededLines || [])
    }

    it ("inits the forwarder service", done => {
        initWillSucceed()

        forwarder.run().then(() => {
            expect(forwarderServiceStub.init).toHaveBeenCalledWith(seededForwarderConfig)
            done()
        })
    })

    it ("fails when the forwarder could not be initialized", done => {
        spyOn(forwarderServiceStub, "init").and.callFake(() => promise.create((fulfill, reject) => {
            reject("something went wrong")
        }))

        forwarder.run().then(null, err => {
            expect(err).toBe("something went wrong")
            done()
        })
    })

    it ("does not read the available lines if the inputs is closed", done => {
        initWillSucceed()
        isInputClosed = true
        getLinesWillReturn()

        forwarder.run().then(() => {
            expect(inputRepositoryStub.getLines).not.toHaveBeenCalled()
            done()
        })
    })
})
