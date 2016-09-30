var rfr = require("rfr")
var promise = require("the-promise-factory")
var programModule = rfr("lib/program")

describe("program", () => {
    var program = null

    var seededProgramInfoConfig = {
        name: "the seeded config"
    }

    var seededForwarder = null
    var seededChildProcess = null

    beforeEach(() => {
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

        program = programModule(programInitializerStub)
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

        program.run().then(exitCode => {
            expect(seededChildProcess.wait).toHaveBeenCalled()
            expect(exitCode).toBe(1)
            done()
        })
    })

    it ("bubbles up forwarder failures", done => {
        childProcessWillSucceed()
        forwarderWillFail()

        program.run().then(exitCode => {
            expect(seededForwarder.run).toHaveBeenCalledWith(seededProgramInfoConfig)
            expect(exitCode).toBe(1)
            done()
        })
    })

    it ("fails when the child process didn't finished with a zero exit code", done => {
        forwarderWillSucceed()
        childProcessWillSucceed(10)

        program.run().then(exitCode => {
            expect(exitCode).toBe(10)
            done()
        })
    })

    it ("successfully finishes when everything is fine", done => {
        forwarderWillSucceed()
        childProcessWillSucceed()

        program.run().then(exitCode => {
            expect(exitCode).toBe(0)
            done()
        })
    })
})
