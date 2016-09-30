var rfr = require("rfr")
var promise = require("the-promise-factory")
var programModule = rfr("lib/program")

describe("program", () => {
    var program = null

    var exitCode = -1
    var seededProgramInfoConfig = {
        name: "the seeded config"
    }

    var seededForwarder = null
    var seededChildProcess = null

    beforeEach(() => {
        exitCode = -1

        seededForwarder = {
            run: () => {}
        }

        seededChildProcess = {
            wait: () => {}
        }

        var programInitializerStub = {
            init: () => {
                return {
                    child: seededChildProcess,
                    config: seededProgramInfoConfig,
                    forwarder: seededForwarder
                }
            }
        }

        var processStub = {
            exit: value => { exitCode = value }
        }

        program = programModule(processStub, programInitializerStub)
    })

    function childProcessWillFail(seededError) {
        if (!seededError){
            seededError = "unexpected child process error"
        }

        spyOn(seededChildProcess, "wait").and.callFake(() => promise.create((fulfill, reject) => {
            reject(seededError)
        }))
    }

    function forwarderWillFail(seededError) {
        if (!seededError){
            seededError = "unexpected forwarder error"
        }

        spyOn(seededForwarder, "run").and.callFake(config => promise.create((fulfill, reject) => {
            reject(seededError)
        }))
    }

    function childProcessWillSucceed(code){
        if(!code){
            code = 0
        }

        spyOn(seededChildProcess, "wait").and.callFake(() => promise.create((fulfill, reject) => {
            fulfill(code)
        }))
    }

    function forwarderWillSucceed(){
        spyOn(seededForwarder, "run").and.callFake(config => promise.create((fulfill, reject) => {
            fulfill()
        }))
    }

    it ("bubbles up child process failures", done => {
        childProcessWillFail()
        forwarderWillSucceed()

        program.run().then(() => {
            expect(seededChildProcess.wait).toHaveBeenCalled()
            expect(exitCode).toBe(1)
            done()
        })
    })

    it ("bubbles up forwarder failures", done => {
        childProcessWillSucceed()
        forwarderWillFail()

        program.run().then(() => {
            expect(seededForwarder.run).toHaveBeenCalledWith(seededProgramInfoConfig)
            expect(exitCode).toBe(1)
            done()
        })
    })

    it ("fails when the child process didn't finished with a zero exit code", done => {
        forwarderWillSucceed()
        childProcessWillSucceed(10)

        program.run().then(() => {
            expect(exitCode).toBe(10)
            done()
        })
    })
})
