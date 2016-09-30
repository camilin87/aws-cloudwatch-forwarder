var rfr = require("rfr")
var promise = require("the-promise-factory")
var programModule = rfr("lib/program")

describe("program", () => {
    var program = null

    var exitCode = -1
    var seededProgramInfoConfig = {
        name: "the seeded config"
    }
    var forwarderConfig = null

    var seededForwarder = null
    var seededChildProcess = null

    beforeEach(() => {
        exitCode = -1
        forwarderConfig = null

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
            forwarderConfig = config
            reject(seededError)
        }))
    }

    function childProcessWillSucceed(){
        spyOn(seededChildProcess, "wait").and.callFake(() => promise.create((fulfill, reject) => {
            fulfill()
        }))
    }

    function forwarderWillSucceed(){
        spyOn(seededForwarder, "run").and.callFake(config => promise.create((fulfill, reject) => {
            forwarderConfig = config
            fulfill()
        }))
    }

    it ("bubbles up child process failures", done => {
        childProcessWillFail()

        program.run().then(() => {
            expect(seededChildProcess.wait).toHaveBeenCalled()
            expect(exitCode).toBe(1)
            done()
        })
    })
})
