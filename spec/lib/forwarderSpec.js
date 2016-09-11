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
    var setLinesInvocations = null

    beforeAll(() => spyOn(console, "log"))

    beforeEach(() => {
        setLinesInvocations = []
        inputRepositoryStub = {
            isInputClosed: () => isInputClosed,
            getLines: () => {},
            setLines: lines => setLinesInvocations.push(lines)
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

    function sendWillSucceed(){
        spyOn(forwarderServiceStub, "send").and.callFake(() => promise.create((fulfill, reject) => {
            fulfill()
        }))
    }

    function getLinesWillReturn(callback){
        spyOn(inputRepositoryStub, "getLines").and.callFake(() => {
            return callback()
        })
    }

    function generateLines(count){
        var result = []
        for (var i = 0; i < count; i++){
            result.push(`line ${i + 1}`)
        }
        return result
    }

    it ("inits the forwarder service", done => {
        initWillSucceed()
        isInputClosed = true

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
        getLinesWillReturn(() => [])

        forwarder.run().then(() => {
            expect(inputRepositoryStub.getLines).not.toHaveBeenCalled()
            done()
        })
    })

    it ("reads the available log lines", done => {
        initWillSucceed()
        isInputClosed = false
        var getLinesCallIdx = 0
        getLinesWillReturn(() => {
            getLinesCallIdx++

            if (getLinesCallIdx === 2){
                isInputClosed = true
            }

            return []
        })

        forwarder.run().then(() => {
            expect(inputRepositoryStub.getLines).toHaveBeenCalled()
            done()
        })
    })

    it ("tries to read the lines after intervals until the stream gets closed", done => {
        initWillSucceed()
        isInputClosed = false
        var getLinesCallIdx = 0
        getLinesWillReturn(() => {
            getLinesCallIdx++

            if (getLinesCallIdx === 5){
                isInputClosed = true
            }

            return []
        })

        forwarder.run({readInterval: 1200}).then(() => {
            expect(getLinesCallIdx).toBe(5)
            expect(setTimeoutStub.calls.count()).toEqual(5);
            expect(setTimeoutStub).toHaveBeenCalledWith(jasmine.any(Function), 1200)
            done()
        })
    })

    it ("does not wait if there are lines", done => {
        initWillSucceed()
        sendWillSucceed()
        isInputClosed = false

        var getLinesCallIdx = 0
        getLinesWillReturn(() => {
            getLinesCallIdx++

            if (getLinesCallIdx === 3){
                isInputClosed = true
            }

            return generateLines(1)
        })

        forwarder.run().then(() => {
            expect(getLinesCallIdx).toBe(3)
            expect(setTimeoutStub).not.toHaveBeenCalled()
            done()
        })
    })

    it ("sends the available lines", done => {
        initWillSucceed()
        sendWillSucceed()
        isInputClosed = false

        var getLinesCallIdx = 0
        getLinesWillReturn(() => {
            getLinesCallIdx++

            if (getLinesCallIdx === 3){
                isInputClosed = true
            }

            return generateLines(2)
        })

        forwarder.run().then(() => {
            expect(forwarderServiceStub.send.calls.count()).toEqual(3);
            expect(forwarderServiceStub.send.calls.argsFor(0)).toEqual([["line 1", "line 2"]]);
            expect(forwarderServiceStub.send.calls.argsFor(1)).toEqual([["line 1", "line 2"]]);
            expect(forwarderServiceStub.send.calls.argsFor(2)).toEqual([["line 1", "line 2"]]);
            done()
        })
    })

    it ("fails when lines could not be sent", done => {
        initWillSucceed()
        isInputClosed = false
        getLinesWillReturn(() => generateLines(2))
        spyOn(forwarderServiceStub, "send").and.callFake(() => promise.create((fulfill, reject) => {
            reject("something went wrong")
        }))

        forwarder.run().then(null, err => {
            expect(err).toBe("something went wrong")
            done()
        })
    })

    it ("clears the lines before sending them", done => {
        initWillSucceed()
        sendWillSucceed()
        isInputClosed = false

        var getLinesCallIdx = 0
        getLinesWillReturn(() => {
            getLinesCallIdx++

            if (getLinesCallIdx === 3){
                isInputClosed = true
            }

            return generateLines(2)
        })

        forwarder.run().then(() => {
            expect(setLinesInvocations).toEqual([
                [], [], []
            ])
            done()
        })
    })
})
