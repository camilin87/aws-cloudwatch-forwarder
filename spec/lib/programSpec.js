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
            seededError = "unexpected error"
        }

        spyOn(seededChildProcess, "wait").and.callFake(() => promise.create((fulfill, reject) => {
            reject(seededError)
        }))
    }

    function childProcessWillSuceed(){
        spyOn(seededChildProcess, "wait").and.callFake(() => promise.create((fulfill, reject) => {
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
